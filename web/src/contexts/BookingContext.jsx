import { createContext, useContext, useState, useCallback } from 'react';

const STEPS = ['unit', 'pet', 'service', 'datetime', 'confirm'];

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [step, setStep] = useState(0);
  const [booking, setBooking] = useState({
    companyId: null,
    company: null,
    petId: null,
    pet: null,
    service: 'banho_tosa',
    date: '',
    time: '',
    notes: '',
    professionalId: null,
  });

  const nextStep = useCallback(() => {
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }, []);

  const prevStep = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const goToStep = useCallback((index) => {
    setStep(Math.max(0, Math.min(index, STEPS.length - 1)));
  }, []);

  const updateBooking = useCallback((data) => {
    setBooking((prev) => ({ ...prev, ...data }));
  }, []);

  const reset = useCallback(() => {
    setStep(0);
    setBooking({
      companyId: null,
      company: null,
      petId: null,
      pet: null,
      service: 'banho_tosa',
      date: '',
      time: '',
      notes: '',
      professionalId: null,
    });
  }, []);

  const currentStepName = STEPS[step];
  const isFirstStep = step === 0;
  const isLastStep = step === STEPS.length - 1;

  return (
    <BookingContext.Provider
      value={{
        step,
        currentStepName,
        steps: STEPS,
        booking,
        updateBooking,
        nextStep,
        prevStep,
        goToStep,
        reset,
        isFirstStep,
        isLastStep,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error('useBooking deve ser usado dentro de BookingProvider');
  }
  return ctx;
}
