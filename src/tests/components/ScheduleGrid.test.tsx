import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScheduleGrid from '@/components/dashboard/ScheduleGrid';
import { initialEvents } from '@/data/mockData';

describe('ScheduleGrid', () => {
  const days = [
    { label: 'Sun 10', date: '2023-12-10', isSelected: false },
    { label: 'Mon 11', date: '2023-12-11', isSelected: true },
    { label: 'Tue 12', date: '2023-12-12', isSelected: false },
    { label: 'Wed 13', date: '2023-12-13', isSelected: false },
    { label: 'Thu 14', date: '2023-12-14', isSelected: false }
  ];

  it('renders each day column and places events on the matching day', () => {
    render(
      <ScheduleGrid days={days} events={initialEvents} onSelectDate={vi.fn()} onSelectEvent={vi.fn()} />
    );

    days.forEach((day) => {
      expect(screen.getByText(day.label)).toBeInTheDocument();
    });

    expect(screen.getByText('Explore Forest Park')).toBeInTheDocument();
    expect(screen.getByText('Mini Soccer')).toBeInTheDocument();
  });

  it('calls onSelectEvent when an event card is clicked', async () => {
    const onSelectEvent = vi.fn();
    render(
      <ScheduleGrid days={days} events={initialEvents} onSelectDate={vi.fn()} onSelectEvent={onSelectEvent} />
    );
    screen.getByText('Mini Soccer').closest('button')?.click();
    expect(onSelectEvent).toHaveBeenCalledWith('evt-soccer');
  });
});
