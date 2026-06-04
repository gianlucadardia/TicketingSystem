import React from 'react';
import { render, screen } from '@testing-library/react';

test('testing library setup works', () => {
  render(<div>frontend test ok</div>);
  const element = screen.getByText(/frontend test ok/i);
  expect(element).toBeInTheDocument();
});
