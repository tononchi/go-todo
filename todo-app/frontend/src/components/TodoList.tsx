import { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Checkbox,
  TextField,
  Button,
  Paper,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { todoApi } from '../api/todoApi';
import { Todo, CreateTodoInput } from '../types/todo';

export const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const fetchedTodos = await todoApi.getAllTodos();
      setTodos(fetchedTodos);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    }
  };

  const handleCreateTodo = async () => {
    if (!newTodoTitle.trim()) return;

    try {
      const input: CreateTodoInput = { title: newTodoTitle.trim() };
      const newTodo = await todoApi.createTodo(input);
      setTodos([...todos, newTodo]);
      setNewTodoTitle('');
    } catch (error) {
      console.error('Failed to create todo:', error);
    }
  };

  const handleToggleTodo = async (todo: Todo) => {
    try {
      const updatedTodo = await todoApi.updateTodo(todo.id, {
        completed: !todo.completed,
      });
      setTodos(
        todos.map((t) => (t.id === updatedTodo.id ? updatedTodo : t))
      );
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await todoApi.deleteTodo(id);
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Todo List
      </Typography>
      <Paper sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Add new todo"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateTodo();
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleCreateTodo}
            disabled={!newTodoTitle.trim()}
          >
            Add
          </Button>
        </Box>
      </Paper>
      <Paper>
        <List>
          {todos.map((todo) => (
            <ListItem
              key={todo.id}
              dense
              divider
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteTodo(todo.id)}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <Checkbox
                edge="start"
                checked={todo.completed}
                onChange={() => handleToggleTodo(todo)}
              />
              <ListItemText
                primary={todo.title}
                sx={{
                  textDecoration: todo.completed ? 'line-through' : 'none',
                }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};
