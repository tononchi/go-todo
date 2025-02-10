import axios from 'axios';
import { CreateTodoInput, Todo, UpdateTodoInput } from '../types/todo';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const api = axios.create({
  baseURL: API_BASE_URL,
});

export const todoApi = {
  async getAllTodos(): Promise<Todo[]> {
    const response = await api.get<Todo[]>('/todos');
    return response.data;
  },

  async createTodo(input: CreateTodoInput): Promise<Todo> {
    const response = await api.post<Todo>('/todos', input);
    return response.data;
  },

  async updateTodo(id: string, input: UpdateTodoInput): Promise<Todo> {
    const response = await api.patch<Todo>(`/todos/${id}`, input);
    return response.data;
  },

  async deleteTodo(id: string): Promise<void> {
    await api.delete(`/todos/${id}`);
  },
};
