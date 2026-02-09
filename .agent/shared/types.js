/**
 * Type definitions for the multi-agent system
 */

/**
 * @typedef {Object} Task
 * @property {string} id - Unique task identifier
 * @property {string} type - Type of task (feature, bug-fix, refactor, etc.)
 * @property {string} description - Task description
 * @property {string} status - Current status (pending, in_progress, completed, failed, blocked)
 * @property {string} assignedAgent - Agent handling this task
 * @property {Object} metadata - Additional task metadata
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 * @property {string[]} dependencies - Task dependencies
 * @property {Object} result - Task result
 */

/**
 * @typedef {Object} AgentState
 * @property {string} id - Agent identifier
 * @property {string} name - Agent name
 * @property {string} status - Agent status (idle, working, blocked, error)
 * @property {Task|null} currentTask - Currently executing task
 * @property {any[]} results - Task results
 * @property {Error[]} errors - Errors encountered
 * @property {Date} lastActive - Last activity timestamp
 */

/**
 * @typedef {Object} SharedState
 * @property {Map<string, AgentState>} agents - Active agents
 * @property {Task[]} taskQueue - Pending tasks
 * @property {Task[]} completedTasks - Completed tasks
 * @property {Object} projectState - Current project snapshot
 * @property {string[]} modifiedFiles - Files modified in current session
 * @property {Object} metrics - Performance metrics
 */

/**
 * @typedef {Object} AgentMessage
 * @property {string} from - Sender agent ID
 * @property {string} to - Recipient agent ID (or 'broadcast')
 * @property {string} type - Message type (task, result, error, query)
 * @property {any} payload - Message payload
 * @property {Date} timestamp - Message timestamp
 */

/**
 * @typedef {Object} WorkflowStep
 * @property {string} id - Step identifier
 * @property {string} agent - Agent to execute step
 * @property {string} action - Action to perform
 * @property {string} description - Step description
 * @property {string[]} dependencies - Step dependencies
 * @property {string[]} onSuccess - Steps to execute on success
 * @property {string[]} onFailure - Steps to execute on failure
 * @property {boolean} optional - Whether step is optional
 */

/**
 * @typedef {Object} Workflow
 * @property {string} name - Workflow name
 * @property {string} description - Workflow description
 * @property {string} trigger - Trigger type (manual, scheduled, event)
 * @property {WorkflowStep[]} steps - Workflow steps
 */

export const TaskStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  BLOCKED: 'blocked'
};

export const AgentStatus = {
  IDLE: 'idle',
  WORKING: 'working',
  BLOCKED: 'blocked',
  ERROR: 'error'
};

export const MessageType = {
  TASK: 'task',
  RESULT: 'result',
  ERROR: 'error',
  QUERY: 'query',
  STATUS: 'status'
};
