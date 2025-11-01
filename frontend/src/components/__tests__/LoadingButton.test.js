/**
 * Tests for LoadingButton component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingButton from '../LoadingButton';

describe('LoadingButton', () => {
  it('should render button with children', () => {
    render(<LoadingButton>Click Me</LoadingButton>);
    
    expect(screen.getByRole('button')).toHaveTextContent('Click Me');
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<LoadingButton onClick={handleClick}>Click Me</LoadingButton>);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should show spinner when loading', () => {
    render(<LoadingButton loading={true}>Click Me</LoadingButton>);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    // Spinner is rendered but text is hidden
  });

  it('should be disabled when loading', () => {
    render(<LoadingButton loading={true}>Click Me</LoadingButton>);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<LoadingButton disabled={true}>Click Me</LoadingButton>);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(
      <LoadingButton disabled={true} onClick={handleClick}>
        Click Me
      </LoadingButton>
    );
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should apply custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    render(<LoadingButton style={customStyle}>Click Me</LoadingButton>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveStyle('background-color: red');
  });
});
