import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import { createComplaint, getLocations, uploadComplaintPhoto } from '@/lib/api';
import type { Location, Category, Priority } from '@/lib/types';
import { CATEGORIES, CATEGORY_LABELS, CATEGORY_ICONS } from '@/lib/constants';
import PageHeader from '@/components/layout/PageHeader';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import LocationPicker from '@/components/shared/LocationPicker';
import ImageUpload from '@/components/shared/ImageUpload';
import { ArrowLeft, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NewComplaintPage() {
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingLocs, setLoadingLocs] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [locationId, setLocationId] = useState<number | null>(null);
  const [locationLabel, setLocationLabel] = useState('');
  const [photoUrl, setPhotoUrl] = useState<File | string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const locs = await getLocations();
        setLocations(locs);
      } catch {
        // non-critical
      } finally {
        setLoadingLocs(false);
      }
    })();
  }, []);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (title.trim().length < 5) e.title = 'Title must be at least 5 characters.';
    if (description.trim().length < 10) e.description = 'Please describe the issue in at least 10 characters.';
    if (!category) e.category = 'Please select a category.';
    if (!locationId) e.location = 'Please select the location of the issue.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const complaint = await createComplaint({
        title: title.trim(),
        description: description.trim(),
        category: category as Category,
        priority,
        location_id: locationId!,
        location_label: locationLabel,
        photo_url: photoUrl,
      });
      success('Request submitted', `Your complaint ${complaint.code} has been filed.`);
      navigate(`/complaints/${complaint.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not submit your request.';
      toastError('Submission failed', msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-ink-navy transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      <PageHeader
        monoLabel="New Request"
        title="Report a maintenance issue"
        subtitle="Provide as much detail as you can so the maintenance team can respond quickly."
      />

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {/* Title */}
        <Input
          label="Title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Broken ceiling fan in classroom"
          error={errors.title}
          required
        />

        {/* Category */}
        <div className="space-y-1.5">
          <label className="block text-sm font-display font-medium text-ink-navy">Category</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat];
              const active = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-md border text-sm font-medium transition-all duration-150 focus-ring ${
                    active
                      ? 'border-signal-amber bg-signal-amber/10 text-ink-navy'
                      : 'border-slate/20 text-slate hover:border-ink-navy/30 hover:bg-ink-navy/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {CATEGORY_LABELS[cat]}
                </button>
              );
            })}
          </div>
          {errors.category && <p className="text-xs text-rust font-medium">{errors.category}</p>}
        </div>

        {/* Priority */}
        <Select
          label="Priority"
          name="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
        >
          <option value="LOW">Low — Minor inconvenience</option>
          <option value="MEDIUM">Medium — Needs attention</option>
          <option value="HIGH">High — Urgent / safety concern</option>
        </Select>

        {/* Location */}
        <div className="space-y-1.5">
          <LocationPicker
            locations={locations}
            value={locationId}
            onChange={(id: number, label: string) => { setLocationId(id); setLocationLabel(label); }}
            error={errors.location}
          />
          {loadingLocs && <p className="text-xs text-stamp-gray">Loading campus locations...</p>}
        </div>

        {/* Description */}
        <Textarea
          label="Description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue in detail. When did it start? Is it affecting classes or daily activities?"
          error={errors.description}
          required
        />

        {/* Photo */}
        <ImageUpload
          label="Photo (optional)"
          hint="JPG / PNG · Max 5MB"
          currentUrl={photoUrl}
          onUpload={(f) => setPhotoUrl(f)}
          uploadFn={uploadComplaintPhoto}
        />

        {/* Submit */}
        <div className="pt-2 flex gap-3">
          <Button type="submit" size="lg" loading={submitting} className="flex-1">
            <Send className="w-4 h-4" /> Submit request
          </Button>
          <Link to="/dashboard">
            <Button type="button" variant="outline" size="lg">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
