/**
 * Stella Mobile — User-Friendly Error Translation (Part 1)
 * Translates raw technical errors into actionable messages with fixes.
 */

export interface StellaError {
  code: string
  userMessage: string
  suggestion: string
  workaround?: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  category: 'network' | 'auth' | 'model' | 'device' | 'permission' | 'storage' | 'engine' | 'unknown'
  retryable: boolean
}

export class StellaErrorTranslator {
  private static readonly ERROR_PATTERNS: Array<{
    match: string | RegExp
    error: Omit<StellaError, 'code'>
  }> = [
    {
      match: /ECONNREFUSED|connection refused|connect ECONNREFUSED/i,
      error: {
        userMessage: 'Unable to connect to the server.',
        suggestion: 'Check that the server is running and reachable. Verify the IP and port in Settings > AI LLM Configurations.',
        workaround: 'Try a different network or check your firewall settings.',
        severity: 'error',
        category: 'network',
        retryable: true,
      },
    },
    {
      match: /ENOTFOUND|getaddrinfo|DNS|name resolution/i,
      error: {
        userMessage: 'Could not resolve the server address.',
        suggestion: 'Check your internet connection and verify the URL endpoint is typed correctly.',
        workaround: 'Try an IP address instead of a hostname, or switch networks.',
        severity: 'error',
        category: 'network',
        retryable: true,
      },
    },
    {
      match: /ETIMEDOUT|timeout|timed out/i,
      error: {
        userMessage: 'The request timed out.',
        suggestion: 'The server may be slow or overloaded. Try again in a moment.',
        workaround: 'Increase the timeout in Settings, or use a smaller model.',
        severity: 'warning',
        category: 'network',
        retryable: true,
      },
    },
    {
      match: /401|unauthorized|invalid api key|authentication failed/i,
      error: {
        userMessage: 'API key is invalid or not authorized.',
        suggestion: 'Go to Settings > AI LLM Configurations, re-enter your API key, and click Test Connection.',
        workaround: 'Verify the key is correct and not expired. Generate a new key from your provider dashboard.',
        severity: 'error',
        category: 'auth',
        retryable: false,
      },
    },
    {
      match: /403|forbidden|access denied/i,
      error: {
        userMessage: 'Access to this model or endpoint is forbidden.',
        suggestion: 'Your API key may not have access to this model. Check your provider account permissions.',
        workaround: 'Select a different model from the dropdown, or upgrade your provider plan.',
        severity: 'error',
        category: 'auth',
        retryable: false,
      },
    },
    {
      match: /402|insufficient|quota|billing|payment required/i,
      error: {
        userMessage: 'Insufficient quota or billing issue.',
        suggestion: 'Your provider account may be out of credits or needs a payment method.',
        workaround: 'Add credits to your provider account, or switch to a local model.',
        severity: 'warning',
        category: 'auth',
        retryable: false,
      },
    },
    {
      match: /429|rate limit|too many requests/i,
      error: {
        userMessage: 'Rate limit exceeded.',
        suggestion: 'You are sending requests too quickly. Wait a moment and try again.',
        workaround: 'Reduce request frequency, or upgrade your plan for higher limits.',
        severity: 'warning',
        category: 'network',
        retryable: true,
      },
    },
    {
      match: /model not found|model does not exist|invalid model/i,
      error: {
        userMessage: 'The selected model is not available.',
        suggestion: 'Go to Settings > AI LLM Configurations and select a different authorized model from the dropdown.',
        workaround: 'Test your API key connection to refresh the available models list.',
        severity: 'error',
        category: 'model',
        retryable: false,
      },
    {
      match: /context length|context window|too many tokens|max tokens/i,
      error: {
        userMessage: 'The conversation is too long for this model.',
        suggestion: 'Start a new chat or clear conversation history to reduce context length.',
        workaround: 'Use a model with a larger context window, or summarize previous messages.',
        severity: 'warning',
        category: 'model',
        retryable: true,
      },
    },
    {
      match: /model file not found|no gguf|model missing|file not found/i,
      error: {
        userMessage: 'Local model file not found.',
        suggestion: 'Go to Settings > Model Folders and point Stella at a folder containing your GGUF models, or download a model from the Download Hub.',
        workaround: 'Import a model from your download hub into a watched model folder.',
        severity: 'error',
        category: 'model',
        retryable: false,
      },
    },
    {
      match: /llama.rn|engine not initialized|inference engine/i,
      error: {
        userMessage: 'The local inference engine is not ready.',
        suggestion: 'Restart Stella and wait for the engine to initialize. Check Settings > Default Engine is set correctly.',
        workaround: 'Switch between Upstream and mbuzai engine in Settings, then retry.',
        severity: 'error',
        category: 'engine',
        retryable: true,
      },
    },
    {
      match: /out of memory|OOM|memory allocation/i,
      error: {
        userMessage: 'Not enough memory to run this model.',
        suggestion: 'Close other apps to free memory, or use a smaller quantized model (Q4_K_M or smaller).',
        workaround: 'Free up RAM by closing background apps, or select a smaller model in Settings.',
        severity: 'error',
        category: 'model',
        retryable: true,
      },
    },
    {
      match: /permission denied|permission/i,
      error: {
        userMessage: 'Permission denied.',
        suggestion: 'Grant the requested permission in Android Settings > Apps > Stella > Permissions.',
        workaround: 'Enable the permission and restart Stella, or disable the feature requiring it.',
        severity: 'error',
        category: 'permission',
        retryable: false,
      },
    },
    {
      match: /storage full|no space|ENOSPACE|disk full/i,
      error: {
        userMessage: 'Storage is full.',
        suggestion: 'Free up space on your device or change the download destination in Settings.',
        workaround: 'Delete unused files or move downloads to an SD card via Settings > Download Destination.',
        severity: 'error',
        category: 'storage',
        retryable: false,
      },
    },
    {
      match: /termux|background process|spawn/i,
      error: {
        userMessage: 'Background operation failed.',
        suggestion: 'Ensure Termux is installed and Stella has permission to run background processes.',
        workaround: 'Install Termux from F-Droid, grant it accessibility permissions, and retry.',
        severity: 'warning',
        category: 'device',
        retryable: true,
      },
    },
    {
      match: /.*/,
      error: {
        userMessage: 'An unexpected error occurred.',
        suggestion: 'Try again. If the problem persists, restart Stella and check your Settings configuration.',
        workaround: 'Contact support or check the audit log for more details.',
        severity: 'error',
        category: 'unknown',
        retryable: true,
      },
    },
  ]
  static translate(
    rawError: Error | string,
    context?: { category?: StellaError['category']; operation?: string; recoverable?: boolean }
  ): StellaError {
    const message = rawError instanceof Error ? rawError.message : String(rawError)
    const code = `ERR_${Date.now().toString(36).toUpperCase()}`

    for (const { match, error } of this.ERROR_PATTERNS) {
      const isMatch = match instanceof RegExp
        ? match.test(message)
        : message.toLowerCase().includes(match.toLowerCase())
      if (isMatch) {
        return {
          code,
          ...error,
          category: context?.category ?? error.category,
          retryable: context?.recoverable !== undefined ? context.recoverable : error.retryable,
        }
      }
    }

    return {
      code,
      userMessage: 'An unexpected error occurred.',
      suggestion: 'Try again. If the problem persists, restart Stella and check your Settings configuration.',
      workaround: 'Check the audit log for technical details.',
      severity: 'error',
      category: context?.category ?? 'unknown',
      retryable: true,
    }
  }

  static format(error: StellaError): string {
    let text = `${error.userMessage}\n\n`
    text += `💡 What to do: ${error.suggestion}\n`
    if (error.workaround) {
      text += `🔄 Workaround: ${error.workaround}\n`
    }
    text += `\nError code: ${error.code}`
    return text
  }
}

export function friendlyError(
  error: Error | string,
  context?: { category?: StellaError['category']; operation?: string; recoverable?: boolean }
): StellaError {
  return StellaErrorTranslator.translate(error, context)
}


    },
  ]
