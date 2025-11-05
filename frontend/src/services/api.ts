import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  CreateGameRequest,
  CreateGameResponse,
  GetGameStateResponse,
  SubmitMoveRequest,
  SubmitMoveResponse,
} from '../types';

// Get API URL from environment or use default
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        if (!this.token) {
          this.token = await AsyncStorage.getItem('token');
        }

        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          await this.handleTokenRefresh();
        }
        return Promise.reject(error);
      }
    );
  }

  private async handleTokenRefresh() {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await axios.post<ApiResponse<{ token: string; refreshToken: string }>>(
        `${API_URL}/api/auth/refresh`,
        { refreshToken }
      );

      if (response.data.success && response.data.data) {
        const { token, refreshToken: newRefreshToken } = response.data.data;
        await this.setTokens(token, newRefreshToken);
      }
    } catch (error) {
      // Refresh failed, clear tokens
      await this.clearTokens();
      throw error;
    }
  }

  async setTokens(token: string, refreshToken: string) {
    this.token = token;
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('refreshToken', refreshToken);
  }

  async clearTokens() {
    this.token = null;
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('refreshToken');
  }

  // Authentication
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.client.post<ApiResponse<AuthResponse>>('/auth/register', data);
    if (response.data.success && response.data.data) {
      const authData = response.data.data;
      await this.setTokens(authData.token, authData.refreshToken);
      return authData;
    }
    throw new Error(response.data.error?.message || 'Registration failed');
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<ApiResponse<AuthResponse>>('/auth/login', data);
    if (response.data.success && response.data.data) {
      const authData = response.data.data;
      await this.setTokens(authData.token, authData.refreshToken);
      return authData;
    }
    throw new Error(response.data.error?.message || 'Login failed');
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } finally {
      await this.clearTokens();
    }
  }

  async getCurrentUser() {
    const response = await this.client.get<ApiResponse<{ user: any }>>('/auth/me');
    if (response.data.success && response.data.data) {
      return response.data.data.user;
    }
    throw new Error('Failed to get current user');
  }

  // Games
  async createGame(data: CreateGameRequest): Promise<CreateGameResponse> {
    const response = await this.client.post<ApiResponse<CreateGameResponse>>('/games/create', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to create game');
  }

  async getGameState(gameId: string): Promise<GetGameStateResponse> {
    const response = await this.client.get<ApiResponse<GetGameStateResponse>>(`/games/${gameId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to get game state');
  }

  async submitMove(gameId: string, data: SubmitMoveRequest): Promise<SubmitMoveResponse> {
    const response = await this.client.post<ApiResponse<SubmitMoveResponse>>(
      `/games/${gameId}/moves`,
      data
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to submit move');
  }

  async getNextPiece(gameId: string): Promise<string> {
    const response = await this.client.get<ApiResponse<{ pieceType: string }>>(
      `/games/${gameId}/next-piece`
    );
    if (response.data.success && response.data.data) {
      return response.data.data.pieceType;
    }
    throw new Error('Failed to get next piece');
  }

  async previewPieces(gameId: string, count: number = 3): Promise<string[]> {
    const response = await this.client.get<ApiResponse<{ preview: string[] }>>(
      `/games/${gameId}/preview?count=${count}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data.preview;
    }
    throw new Error('Failed to preview pieces');
  }

  async getMyActiveGames() {
    const response = await this.client.get<ApiResponse<{ games: any[] }>>('/games/my-active');
    if (response.data.success && response.data.data) {
      return response.data.data.games;
    }
    throw new Error('Failed to get active games');
  }

  async validateMove(gameId: string, piece: any): Promise<{ valid: boolean; reason?: string }> {
    const response = await this.client.post<ApiResponse<{ valid: boolean; reason?: string }>>(
      `/games/${gameId}/validate-move`,
      piece
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('Failed to validate move');
  }

  async calculateGhostPosition(gameId: string, piece: any): Promise<{ x: number; y: number }> {
    const response = await this.client.post<ApiResponse<{ ghostPosition: { x: number; y: number } }>>(
      `/games/${gameId}/ghost-position`,
      piece
    );
    if (response.data.success && response.data.data) {
      return response.data.data.ghostPosition;
    }
    throw new Error('Failed to calculate ghost position');
  }
}

export const api = new ApiClient();
