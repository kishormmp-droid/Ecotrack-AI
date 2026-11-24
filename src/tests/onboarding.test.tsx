import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { OnboardingPage } from '../features/onboarding/OnboardingPage';
import { getStoredOnboarding } from '../services/storage';

describe('Onboarding Flow Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders Step 1 (About You) and shows step indicator', () => {
    render(
      <BrowserRouter>
        <OnboardingPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Step 1 of 7/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /About You/i })).toBeInTheDocument();
  });

  it('validates mandatory fields on Step 1 when clicking Next without filling', () => {
    render(
      <BrowserRouter>
        <OnboardingPage />
      </BrowserRouter>
    );

    const nextBtn = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextBtn);

    // Validation error should trigger
    expect(screen.getByText(/Please provide your name or nickname/i)).toBeInTheDocument();
  });

  it('autosaves inputs to localStorage and advances to Step 2 upon valid input', () => {
    render(
      <BrowserRouter>
        <OnboardingPage />
      </BrowserRouter>
    );

    const nameInput = screen.getByPlaceholderText(/e\.g\. Priya/i);
    const cityInput = screen.getByPlaceholderText(/e\.g\. Bengaluru/i);

    fireEvent.change(nameInput, { target: { value: 'Arjun' } });
    fireEvent.change(cityInput, { target: { value: 'Hyderabad' } });

    // Verify autosave to localStorage
    const saved = getStoredOnboarding();
    expect(saved.name).toBe('Arjun');
    expect(saved.city).toBe('Hyderabad');

    // Proceed to Step 2
    const nextBtn = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText(/Step 2 of 7/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Transportation Profile/i })).toBeInTheDocument();
  });
});
