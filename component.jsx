import { FC, KeyboardEventHandler, SetStateAction, useEffect, useRef, useState } from 'react';
import { Dispatch } from 'react';

import { Button, CircularProgress, FormControl, FormLabel } from '@mui/material';

import { FilledInput } from 'common/components/ui';

import * as S from './styles';

const optCodeLength = 4;
const availableDigit = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const isSingleDigit = (value: string): boolean => !Number.isNaN(parseInt(value));

const keysDispatch = {
  Number: (
    itemIdx: number,
    setValue: Dispatch<SetStateAction<string[]>>,
    setActiveIndex: Dispatch<SetStateAction<number>>,
    digitValue: string,
  ) => {
    if (!isSingleDigit(digitValue)) return;

    setValue((prevCode) => {
      const copy = [...prevCode];
      copy[itemIdx] = digitValue;
      return copy;
    });

    if (digitValue && itemIdx < optCodeLength - 1) {
      setActiveIndex(itemIdx + 1);
    }
  },
  Backspace: (
    itemIdx: number,
    setValue: Dispatch<SetStateAction<string[]>>,
    setActiveIndex: Dispatch<SetStateAction<number>>,
  ): void => {
    setValue((prevValue) => {
      const copy = [...prevValue];
      copy[itemIdx] = '';
      return copy;
    });

    itemIdx > 0 && setActiveIndex(itemIdx - 1);
  },
  Delete: (itemIdx: number, setValue: Dispatch<SetStateAction<string[]>>) => {
    setValue((prevValue) => {
      const copy = [...prevValue];
      copy[itemIdx] = '';
      return copy;
    });
  },
  ArrowLeft: (itemIdx: number, _, setActiveIndex: Dispatch<SetStateAction<number>>) => {
    itemIdx > 0 && setActiveIndex(itemIdx - 1);
  },
  ArrowRight: (itemIdx: number, _, setActiveIndex: Dispatch<SetStateAction<number>>) => {
    itemIdx < optCodeLength - 1 && setActiveIndex(itemIdx + 1);
  },
};

const OtpForm: FC = () => {
  const [otpCode, setOtpCode] = useState<string[]>(Array(optCodeLength).fill(''));
  const [activeInputIndex, setActiveInputIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleKeyDown =
    (index: number): KeyboardEventHandler<HTMLDivElement> =>
    (event) => {
      if (availableDigit.includes(event.key)) {
        keysDispatch.Number(index, setOtpCode, setActiveInputIndex, event.key);
        return;
      }

      const handler = keysDispatch[event.key];
      handler && handler(index, setOtpCode, setActiveInputIndex);
    };

  const handleSubmitOtpCode = () => {};

  useEffect(() => {
    if (inputsRef.current) {
      inputsRef.current[activeInputIndex]?.querySelector('input')?.focus();
    }
  }, [activeInputIndex]);

  useEffect(() => {
    otpCode.join('').length === optCodeLength && handleSubmitOtpCode();
  }, [otpCode]);

  return (
    <FormControl fullWidth>
      <h2>Hi there</h2>
      <FormLabel htmlFor={'123'}>
        <S.FormLabelTypography variant="body2">
          Type code, which sent to your phone by sms
        </S.FormLabelTypography>
      </FormLabel>

      <S.OtpInputsContainer>
        {isLoading && <S.CircularContainer size={32} />}
        {!isLoading &&
          otpCode.map((_, index) => (
            <FilledInput
              key={index}
              type="text"
              placeholder="0"
              value={otpCode[index]}
              onKeyDown={handleKeyDown(index)}
              ref={(otpInput) => {
                inputsRef.current[index] = otpInput;
              }}
            />
          ))}
      </S.OtpInputsContainer>

      <Button
        disabled
        fullWidth
        variant="contained"
        sx={{ justifyContent: 'center', fontWeight: '500' }}
      >
        Resent Code
      </Button>
    </FormControl>
  );
};

export default OtpForm;
