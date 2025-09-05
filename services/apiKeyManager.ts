// API Key management service
class ApiKeyManager {
  private static instance: ApiKeyManager;
  private apiKey: string | null = null;
  private listeners: Set<(key: string | null) => void> = new Set();

  private constructor() {
    // Load API key from localStorage on initialization
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      this.apiKey = storedKey;
    }
  }

  static getInstance(): ApiKeyManager {
    if (!ApiKeyManager.instance) {
      ApiKeyManager.instance = new ApiKeyManager();
    }
    return ApiKeyManager.instance;
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  setApiKey(key: string): void {
    this.apiKey = key;
    localStorage.setItem('gemini_api_key', key);
    this.notifyListeners();
  }

  clearApiKey(): void {
    this.apiKey = null;
    localStorage.removeItem('gemini_api_key');
    this.notifyListeners();
  }

  isApiKeySet(): boolean {
    return this.apiKey !== null && this.apiKey.length > 0;
  }

  subscribe(listener: (key: string | null) => void): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.apiKey));
  }
}

export default ApiKeyManager.getInstance();