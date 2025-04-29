import Dockerode from 'dockerode';
import { ContainerSpecification } from '../types/models';
import config from '../config';
import { createLogger } from './logger';

const logger = createLogger('docker-util');

/**
 * Docker client for container management
 */
export class DockerClient {
  private docker: Dockerode;

  /**
   * Initialize the Docker client
   */
  constructor() {
    this.docker = new Dockerode({
      socketPath: config.docker.socketPath,
    });
    
    logger.info('Docker client initialized');
  }

  /**
   * Validate Docker connection
   * @returns True if connected
   */
  public async validateConnection(): Promise<boolean> {
    try {
      const info = await this.docker.info();
      logger.info(`Connected to Docker. Version: ${info.ServerVersion}`);
      return true;
    } catch (error) {
      logger.error('Failed to connect to Docker:', error);
      return false;
    }
  }

  /**
   * Deploy a container
   * @param leaseId Lease ID for reference
   * @param orderId Order ID for reference
   * @param spec Container specification
   * @returns Container ID
   */
  public async deployContainer(
    leaseId: number,
    orderId: number,
    spec: ContainerSpecification
  ): Promise<string> {
    try {
      logger.info(`Deploying container for lease ${leaseId}, order ${orderId}`);
      
      // Prepare container creation options
      const createOptions = {
        Image: spec.image,
        name: `akash-${orderId}-${leaseId}`,
        Env: this.formatEnvironmentVariables(spec.env || {}),
        Cmd: spec.command,
        ExposedPorts: this.formatExposedPorts(spec.ports || []),
        HostConfig: {
          Binds: this.formatVolumes(spec.volumes || []),
          PortBindings: this.formatPortBindings(spec.ports || []),
          Resources: {
            Memory: spec.memory * 1024 * 1024, // Convert MB to bytes
            NanoCpus: spec.cpu * 1000000000, // Convert CPU units to nano CPUs
          },
        },
        Labels: {
          'akash.lease.id': leaseId.toString(),
          'akash.order.id': orderId.toString(),
          'akash.deployment.time': new Date().toISOString(),
        },
      };
      
      // Pull the image if not available
      await this.pullImage(spec.image);
      
      // Create and start the container
      const container = await this.docker.createContainer(createOptions);
      await container.start();
      
      const containerId = container.id;
      logger.info(`Container deployed with ID ${containerId}`);
      
      return containerId;
    } catch (error) {
      logger.error(`Failed to deploy container for lease ${leaseId}:`, error);
      throw new Error(`Container deployment failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Stop and remove a container
   * @param containerId Container ID
   */
  public async stopContainer(containerId: string): Promise<void> {
    try {
      logger.info(`Stopping container ${containerId}`);
      const container = this.docker.getContainer(containerId);
      
      // Check if container exists and is running
      const inspectData = await container.inspect();
      
      if (inspectData && inspectData.State.Running) {
        await container.stop({ t: 10 }); // 10 second timeout
        logger.info(`Container ${containerId} stopped`);
      } else {
        logger.info(`Container ${containerId} is already stopped`);
      }
    } catch (error) {
      logger.error(`Failed to stop container ${containerId}:`, error);
      throw new Error(`Container stop failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Remove a container
   * @param containerId Container ID
   */
  public async removeContainer(containerId: string): Promise<void> {
    try {
      logger.info(`Removing container ${containerId}`);
      const container = this.docker.getContainer(containerId);
      
      // Force remove the container
      await container.remove({ force: true });
      logger.info(`Container ${containerId} removed`);
    } catch (error) {
      logger.error(`Failed to remove container ${containerId}:`, error);
      throw new Error(`Container removal failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check container health
   * @param containerId Container ID
   * @returns Container status object
   */
  public async checkContainerHealth(containerId: string): Promise<{
    status: 'running' | 'stopped' | 'not_found';
    exitCode?: number;
    startedAt?: string;
    finishedAt?: string;
    stats?: {
      cpuPercentage: number;
      memoryUsage: number;
      memoryLimit: number;
    };
  }> {
    try {
      logger.info(`Checking health for container ${containerId}`);
      const container = this.docker.getContainer(containerId);
      
      try {
        // Get container info
        const inspectData = await container.inspect();
        
        // Get container stats
        const stats = await container.stats({ stream: false });
        
        const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
        const systemCpuDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
        const cpuPercentage = (cpuDelta / systemCpuDelta) * stats.cpu_stats.online_cpus * 100;
        
        if (inspectData.State.Running) {
          logger.info(`Container ${containerId} is running`);
          return {
            status: 'running',
            startedAt: inspectData.State.StartedAt,
            stats: {
              cpuPercentage,
              memoryUsage: stats.memory_stats.usage,
              memoryLimit: stats.memory_stats.limit,
            },
          };
        } else {
          logger.info(`Container ${containerId} is stopped with exit code ${inspectData.State.ExitCode}`);
          return {
            status: 'stopped',
            exitCode: inspectData.State.ExitCode,
            startedAt: inspectData.State.StartedAt,
            finishedAt: inspectData.State.FinishedAt,
          };
        }
      } catch (error) {
        if ((error as any).statusCode === 404) {
          logger.info(`Container ${containerId} not found`);
          return {
            status: 'not_found',
          };
        }
        throw error;
      }
    } catch (error) {
      logger.error(`Failed to check health for container ${containerId}:`, error);
      throw new Error(`Health check failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get container logs
   * @param containerId Container ID
   * @returns Container logs
   */
  public async getContainerLogs(containerId: string): Promise<string> {
    try {
      logger.info(`Getting logs for container ${containerId}`);
      const container = this.docker.getContainer(containerId);
      
      const logs = await container.logs({
        stdout: true,
        stderr: true,
        tail: 100, // Get last 100 lines
        timestamps: true,
      });
      
      // Convert Buffer to string
      const logString = logs.toString('utf8');
      
      logger.info(`Retrieved logs for container ${containerId}`);
      return logString;
    } catch (error) {
      logger.error(`Failed to get logs for container ${containerId}:`, error);
      throw new Error(`Get logs failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Pull a Docker image
   * @param image Image name
   */
  private async pullImage(image: string): Promise<void> {
    try {
      logger.info(`Pulling image ${image}`);
      
      // Check if image already exists
      const images = await this.docker.listImages();
      const imageExists = images.some(img => 
        img.RepoTags && img.RepoTags.includes(image)
      );
      
      if (imageExists) {
        logger.info(`Image ${image} already exists`);
        return;
      }
      
      // Pull the image
      await new Promise<void>((resolve, reject) => {
        this.docker.pull(image, (err: any, stream: any) => {
          if (err) {
            reject(err);
            return;
          }
          
          this.docker.modem.followProgress(stream, (err: any) => {
            if (err) {
              reject(err);
              return;
            }
            
            logger.info(`Image ${image} pulled successfully`);
            resolve();
          });
        });
      });
    } catch (error) {
      logger.error(`Failed to pull image ${image}:`, error);
      throw new Error(`Image pull failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Format environment variables for Docker
   * @param env Environment variables
   * @returns Formatted environment variables
   */
  private formatEnvironmentVariables(env: Record<string, string>): string[] {
    return Object.entries(env).map(([key, value]) => `${key}=${value}`);
  }

  /**
   * Format exposed ports for Docker
   * @param ports Port mappings
   * @returns Formatted exposed ports
   */
  private formatExposedPorts(ports: Array<{
    containerPort: number;
    hostPort?: number;
    protocol?: 'tcp' | 'udp';
  }>): Record<string, {}> {
    const exposedPorts: Record<string, {}> = {};
    
    ports.forEach(port => {
      const protocol = port.protocol || 'tcp';
      exposedPorts[`${port.containerPort}/${protocol}`] = {};
    });
    
    return exposedPorts;
  }

  /**
   * Format port bindings for Docker
   * @param ports Port mappings
   * @returns Formatted port bindings
   */
  private formatPortBindings(ports: Array<{
    containerPort: number;
    hostPort?: number;
    protocol?: 'tcp' | 'udp';
  }>): Record<string, Array<{ HostPort: string }>> {
    const portBindings: Record<string, Array<{ HostPort: string }>> = {};
    
    ports.forEach(port => {
      const protocol = port.protocol || 'tcp';
      const hostPort = port.hostPort?.toString() || '';
      
      portBindings[`${port.containerPort}/${protocol}`] = [
        { HostPort: hostPort },
      ];
    });
    
    return portBindings;
  }

  /**
   * Format volumes for Docker
   * @param volumes Volume mappings
   * @returns Formatted volumes
   */
  private formatVolumes(volumes: Array<{
    hostPath?: string;
    containerPath: string;
    size?: number;
  }>): string[] {
    return volumes
      .filter(volume => volume.hostPath) // Filter out volumes without host path
      .map(volume => `${volume.hostPath}:${volume.containerPath}`);
  }
}

// Export singleton instance
export const dockerClient = new DockerClient();