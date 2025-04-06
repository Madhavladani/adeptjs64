import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface CaptchaProps {
  onChange: (isValid: boolean) => void;
}

export function Captcha({ onChange }: CaptchaProps) {
  const [captchaText, setCaptchaText] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
      captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return captcha;
  };

  const drawCaptcha = (text: string) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set background
    ctx.fillStyle = '#f4f4f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add noise (dots)
    for (let i = 0; i < 100; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 2,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.5})`;
      ctx.fill();
    }
    
    // Add lines for more distraction
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.strokeStyle = `rgba(0, 0, 0, ${Math.random() * 0.5})`;
      ctx.lineWidth = Math.random() * 2;
      ctx.stroke();
    }
    
    // Set text properties
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw each character with slight variations
    for (let i = 0; i < text.length; i++) {
      const char = text.charAt(i);
      ctx.fillStyle = `rgb(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)})`;
      const x = 20 + i * 30 + Math.random() * 10 - 5;
      const y = canvas.height / 2 + Math.random() * 10 - 5;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((Math.random() * 0.4) - 0.2);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  };

  const refreshCaptcha = () => {
    const newCaptcha = generateCaptcha();
    setCaptchaText(newCaptcha);
    setUserInput('');
    setIsValid(false);
    onChange(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);
    const captchaIsValid = value === captchaText;
    setIsValid(captchaIsValid);
    onChange(captchaIsValid);
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  useEffect(() => {
    if (captchaText) {
      drawCaptcha(captchaText);
    }
  }, [captchaText]);

  return (
    <div className="space-y-2">
      <Label htmlFor="captcha">Captcha</Label>
      <div className="flex flex-col space-y-2">
        <div className="relative">
          <canvas 
            ref={canvasRef} 
            width={200} 
            height={50} 
            className="border border-gray-300 rounded-md"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0"
            onClick={refreshCaptcha}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <Input
          id="captcha"
          placeholder="Enter captcha text"
          value={userInput}
          onChange={handleInputChange}
          className={isValid ? "border-green-500" : userInput ? "border-red-500" : ""}
        />
      </div>
    </div>
  );
} 