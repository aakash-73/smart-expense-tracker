import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Login from './Login';
import * as service from '../services/service';

vi.mock('../services/service', () => ({
  login: vi.fn(),
}));

describe('Login Component', () => {
  it('renders login form correctly', () => {
    render(<Login />);
    
    expect(screen.getByPlaceholderText('Username')).toBeDefined();
    expect(screen.getByPlaceholderText('Password')).toBeDefined();
    expect(screen.getByRole('button', { name: /login/i })).toBeDefined();
  });

  it('displays error on failed login', async () => {
    service.login.mockRejectedValueOnce(new Error('Invalid credentials'));
    
    render(<Login />);
    
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'wronguser' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Wait for the error text to appear
    const errorMsg = await screen.findByText('Invalid credentials');
    expect(errorMsg).toBeDefined();
  });
});
