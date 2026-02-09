import { EventEmitter } from 'events';
import { Logger } from './utils.js';
import { MessageType } from './types.js';

const logger = new Logger('Communication');

/**
 * Message Bus for agent communication
 */
export class MessageBus extends EventEmitter {
  constructor() {
    super();
    this.messages = [];
    this.subscribers = new Map();
  }

  /**
   * Send a message
   */
  send(message) {
    logger.debug(`Message: ${message.from} -> ${message.to}`, message.type);

    this.messages.push({
      ...message,
      timestamp: new Date()
    });

    if (message.to === 'broadcast') {
      this.emit('broadcast', message);
    } else {
      this.emit(`message:${message.to}`, message);
    }
  }

  /**
   * Subscribe to messages for a specific agent
   */
  subscribe(agentId, callback) {
    this.on(`message:${agentId}`, callback);
    this.on('broadcast', callback);

    if (!this.subscribers.has(agentId)) {
      this.subscribers.set(agentId, []);
    }

    this.subscribers.get(agentId).push(callback);
  }

  /**
   * Unsubscribe from messages
   */
  unsubscribe(agentId) {
    this.removeAllListeners(`message:${agentId}`);
    this.subscribers.delete(agentId);
  }

  /**
   * Get message history
   */
  getHistory(filter = {}) {
    let filtered = this.messages;

    if (filter.from) {
      filtered = filtered.filter(m => m.from === filter.from);
    }

    if (filter.to) {
      filtered = filtered.filter(m => m.to === filter.to);
    }

    if (filter.type) {
      filtered = filtered.filter(m => m.type === filter.type);
    }

    return filtered;
  }

  /**
   * Clear message history
   */
  clear() {
    this.messages = [];
  }
}

/**
 * State Manager for shared state
 */
export class StateManager {
  constructor() {
    this.state = {
      agents: new Map(),
      taskQueue: [],
      completedTasks: [],
      projectState: {},
      modifiedFiles: [],
      metrics: {
        tasksCompleted: 0,
        tasksFailed: 0,
        totalExecutionTime: 0
      }
    };
    this.logger = new Logger('StateManager');
  }

  /**
   * Update agent state
   */
  updateAgentState(agentId, state) {
    this.state.agents.set(agentId, {
      ...state,
      lastUpdated: new Date()
    });

    this.logger.debug(`Agent state updated: ${agentId}`, state.status);
  }

  /**
   * Get agent state
   */
  getAgentState(agentId) {
    return this.state.agents.get(agentId);
  }

  /**
   * Get all agents state
   */
  getAllAgentsState() {
    return Array.from(this.state.agents.entries()).map(([id, state]) => ({
      id,
      ...state
    }));
  }

  /**
   * Add task to queue
   */
  addTask(task) {
    this.state.taskQueue.push(task);
    this.logger.info(`Task added to queue: ${task.description}`);
  }

  /**
   * Get next task from queue
   */
  getNextTask() {
    return this.state.taskQueue.shift();
  }

  /**
   * Mark task as completed
   */
  completeTask(task, result) {
    this.state.completedTasks.push({
      ...task,
      result,
      completedAt: new Date()
    });

    this.state.metrics.tasksCompleted++;
    this.logger.info(`Task completed: ${task.description}`);
  }

  /**
   * Mark task as failed
   */
  failTask(task, error) {
    this.state.completedTasks.push({
      ...task,
      error,
      failed: true,
      completedAt: new Date()
    });

    this.state.metrics.tasksFailed++;
    this.logger.error(`Task failed: ${task.description}`, error);
  }

  /**
   * Add modified file
   */
  addModifiedFile(filePath) {
    if (!this.state.modifiedFiles.includes(filePath)) {
      this.state.modifiedFiles.push(filePath);
    }
  }

  /**
   * Get modified files
   */
  getModifiedFiles() {
    return this.state.modifiedFiles;
  }

  /**
   * Clear modified files
   */
  clearModifiedFiles() {
    this.state.modifiedFiles = [];
  }

  /**
   * Update project state
   */
  updateProjectState(key, value) {
    this.state.projectState[key] = value;
  }

  /**
   * Get project state
   */
  getProjectState() {
    return this.state.projectState;
  }

  /**
   * Get metrics
   */
  getMetrics() {
    return {
      ...this.state.metrics,
      taskQueueLength: this.state.taskQueue.length,
      completedTasksCount: this.state.completedTasks.length,
      activeAgents: this.state.agents.size
    };
  }

  /**
   * Get full state snapshot
   */
  getSnapshot() {
    return {
      agents: this.getAllAgentsState(),
      taskQueue: this.state.taskQueue,
      completedTasks: this.state.completedTasks,
      projectState: this.state.projectState,
      modifiedFiles: this.state.modifiedFiles,
      metrics: this.getMetrics(),
      timestamp: new Date()
    };
  }
}

// Export singleton instances
export const messageBus = new MessageBus();
export const stateManager = new StateManager();
