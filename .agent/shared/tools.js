import { readFile, writeFile, execCommand, Logger } from './utils.js';

const logger = new Logger('Tools');

/**
 * Tool definitions for agent runtime.
 */
export const toolDefinitions = [
  {
    name: 'read_file',
    description: 'Read content from a file in the project',
    input_schema: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'Path to the file relative to project root'
        }
      },
      required: ['file_path']
    }
  },
  {
    name: 'write_file',
    description: 'Write content to a file in the project',
    input_schema: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'Path to the file relative to project root'
        },
        content: {
          type: 'string',
          description: 'Content to write to the file'
        }
      },
      required: ['file_path', 'content']
    }
  },
  {
    name: 'execute_command',
    description: 'Execute a shell command',
    input_schema: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'Shell command to execute'
        },
        cwd: {
          type: 'string',
          description: 'Working directory for the command (optional)'
        }
      },
      required: ['command']
    }
  },
  {
    name: 'search_code',
    description: 'Search for code patterns in the project',
    input_schema: {
      type: 'object',
      properties: {
        pattern: {
          type: 'string',
          description: 'Search pattern (regex supported)'
        },
        file_pattern: {
          type: 'string',
          description: 'File pattern to search in (e.g., "**/*.js")'
        }
      },
      required: ['pattern']
    }
  },
  {
    name: 'list_files',
    description: 'List files in a directory',
    input_schema: {
      type: 'object',
      properties: {
        directory: {
          type: 'string',
          description: 'Directory path relative to project root'
        },
        pattern: {
          type: 'string',
          description: 'Optional glob pattern to filter files'
        }
      },
      required: ['directory']
    }
  }
];

/**
 * Execute a tool based on its name and input
 */
export async function executeTool(toolName, toolInput) {
  logger.debug(`Executing tool: ${toolName}`, toolInput);

  try {
    switch (toolName) {
      case 'read_file':
        return await readFile(toolInput.file_path);

      case 'write_file':
        await writeFile(toolInput.file_path, toolInput.content);
        return `Successfully wrote to ${toolInput.file_path}`;

      case 'execute_command':
        const result = await execCommand(toolInput.command, toolInput.cwd);
        return result.stdout || result.stderr;

      case 'search_code':
        const searchResult = await execCommand(
          `grep -r ${toolInput.pattern} ${toolInput.file_pattern || '.'}`
        );
        return searchResult.stdout;

      case 'list_files':
        const lsResult = await execCommand(`ls -la ${toolInput.directory}`);
        return lsResult.stdout;

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    logger.error(`Tool execution failed: ${toolName}`, error);
    throw error;
  }
}

/**
 * Process tool calls from Claude's response
 */
export async function processToolCalls(content) {
  const results = [];

  for (const block of content) {
    if (block.type === 'tool_use') {
      const result = await executeTool(block.name, block.input);
      results.push({
        type: 'tool_result',
        tool_use_id: block.id,
        content: result
      });
    }
  }

  return results;
}

