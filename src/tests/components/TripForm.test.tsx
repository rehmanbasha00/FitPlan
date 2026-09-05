import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TripForm from '@/components/trips/TripForm';
import { renderWithStore } from '../testUtils';

describe('TripForm', () => {
  it('shows validation errors when required fields are missing', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithStore(<TripForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /create trip/i }));

    expect(await screen.findByText(/trip name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/destination is required/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits valid trip details', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithStore(<TripForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/trip name/i), 'Bali Getaway');
    await user.type(screen.getByLabelText(/destination/i), 'Bali');
    await user.type(screen.getByLabelText(/start date/i), '2024-01-10');
    await user.type(screen.getByLabelText(/end date/i), '2024-01-15');

    await user.click(screen.getByRole('button', { name: /create trip/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Bali Getaway', destination: 'Bali', status: 'upcoming' })
    );
  });

  it('rejects an end date before the start date', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithStore(<TripForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/trip name/i), 'Bali Getaway');
    await user.type(screen.getByLabelText(/destination/i), 'Bali');
    await user.type(screen.getByLabelText(/start date/i), '2024-01-15');
    await user.type(screen.getByLabelText(/end date/i), '2024-01-10');

    await user.click(screen.getByRole('button', { name: /create trip/i }));

    expect(await screen.findByText(/end date must be after the start date/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
