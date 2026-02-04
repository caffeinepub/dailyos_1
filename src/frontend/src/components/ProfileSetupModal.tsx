import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import AppButton from './AppButton';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { UserProfile } from '../backend';
import { normalizeError } from '../utils/errors';

interface ProfileSetupModalProps {
  open: boolean;
  existingProfile: UserProfile | null | undefined;
}

export default function ProfileSetupModal({ open, existingProfile }: ProfileSetupModalProps) {
  const [username, setUsername] = useState('');
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();

  useEffect(() => {
    if (open) {
      setUsername('');
    }
  }, [open]);

  const isRepairMode = existingProfile !== null && existingProfile !== undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    const profileData: UserProfile = isRepairMode
      ? {
          ...existingProfile,
          username: username.trim(),
          updatedAt: BigInt(Date.now()),
        }
      : {
          username: username.trim(),
          email: undefined,
          theme: { __kind__: 'light', light: null },
          language: { __kind__: 'english', english: null },
          createdAt: BigInt(Date.now()),
          updatedAt: BigInt(Date.now()),
        };

    saveProfile(profileData, {
      onSuccess: () => {
        toast.success(isRepairMode ? 'Username updated successfully!' : 'Profile created successfully!');
        setUsername('');
      },
      onError: (error: unknown) => {
        const message = normalizeError(error);
        toast.error(message);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md data-[state=open]:animate-modal-fade-in data-[state=closed]:animate-modal-fade-out" 
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {isRepairMode ? 'Set Your Username' : 'Welcome to DailyOS!'}
          </DialogTitle>
          <DialogDescription>
            {isRepairMode
              ? 'Please choose a username to continue using DailyOS.'
              : 'Please choose a username to complete your profile setup.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              autoFocus
            />
          </div>
          <AppButton type="submit" className="w-full" disabled={isPending}>
            {isPending ? (isRepairMode ? 'Updating...' : 'Creating Profile...') : (isRepairMode ? 'Set Username' : 'Create Profile')}
          </AppButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
