import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import AppButton from '../AppButton';
import { Textarea } from '../ui/textarea';
import { useGetJournalByDate, useCreateJournal, useUpdateJournal } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { JournalAccessType } from '../../backend';
import { toast } from 'sonner';

interface JournalSectionProps {
  selectedDate: string;
}

export default function JournalSection({ selectedDate }: JournalSectionProps) {
  const { identity } = useInternetIdentity();
  const { data: journal, isLoading } = useGetJournalByDate(selectedDate);
  const { mutate: createJournal, isPending: isCreating } = useCreateJournal();
  const { mutate: updateJournal, isPending: isUpdating } = useUpdateJournal();
  const [content, setContent] = useState('');

  useEffect(() => {
    setContent(journal?.content || '');
  }, [journal]);

  const handleSave = () => {
    if (!identity) {
      toast.error('Please log in to save journal entries.');
      return;
    }

    if (journal) {
      updateJournal({
        ...journal,
        content,
        updatedAt: BigInt(Date.now()),
      });
    } else {
      createJournal({
        title: `Journal - ${selectedDate}`,
        content,
        date: selectedDate,
        locked: false,
        accessType: JournalAccessType.private_journal_access,
        entropy: BigInt(0),
        hasAttachments: false,
        createdAt: BigInt(Date.now()),
        updatedAt: BigInt(Date.now()),
        sharedWith: undefined,
        coverImage: undefined,
        colorHex: undefined,
      });
    }
  };

  const isSaving = isCreating || isUpdating;
  const hasChanges = content !== (journal?.content || '');

  return (
    <Card className="dashboard-card dashboard-card-journal">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Daily Journal</CardTitle>
          <AppButton
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !hasChanges || !identity}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </AppButton>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground text-center py-8">Loading...</p>
        ) : (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your thoughts, reflections, and notes for the day..."
            className="min-h-[400px] resize-none"
            disabled={!identity}
          />
        )}
      </CardContent>
    </Card>
  );
}
