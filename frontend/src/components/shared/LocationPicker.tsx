import { useState, useMemo, useEffect } from 'react';
import type { Location } from '@/lib/types';
import { Select } from '@/components/ui/Select';
import { Building2, Layers, DoorOpen } from 'lucide-react';

interface LocationPickerProps {
  locations: Location[];
  value: number | null;
  onChange: (locationId: number, label: string) => void;
  error?: string;
}

export default function LocationPicker({ locations, value, onChange, error }: LocationPickerProps) {
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [room, setRoom] = useState('');

  // Restore from value
  useEffect(() => {
    if (value != null && value !== 0) {
      const loc = locations.find((l) => l.id === value);
      if (loc) {
        setBuilding(loc.building);
        setFloor(loc.floor);
        setRoom(loc.room);
      }
    }
  }, [value, locations]);

  const buildings = useMemo(() => {
    return [...new Set(locations.map((l) => l.building))].sort();
  }, [locations]);

  const floors = useMemo(() => {
    if (!building) return [];
    return [...new Set(locations.filter((l) => l.building === building).map((l) => l.floor))].sort();
  }, [building, locations]);

  const rooms = useMemo(() => {
    if (!building || !floor) return [];
    return locations.filter((l) => l.building === building && l.floor === floor).sort((a, b) => a.room.localeCompare(b.room));
  }, [building, floor, locations]);

  function handleRoomChange(roomVal: string) {
    setRoom(roomVal);
    const loc = locations.find((l) => l.building === building && l.floor === floor && l.room === roomVal);
    if (loc) onChange(loc.id, loc.label);
  }

  const stepClass = (active: boolean) =>
    `transition-all duration-300 ${active ? 'opacity-100 translate-y-0 max-h-60' : 'opacity-0 -translate-y-2 max-h-0 overflow-hidden'}`;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Building2 className="w-4 h-4 text-ink-navy" />
        <span className="text-sm font-display font-medium text-ink-navy">Location</span>
      </div>
      {error && <p className="text-xs text-rust font-medium">{error}</p>}

      {/* Step 1: Building */}
      <div className={stepClass(true)}>
        <Select
          value={building}
          onChange={(e) => { setBuilding(e.target.value); setFloor(''); setRoom(''); onChange(0, ''); }}
          placeholder="Select building"
        >
          {buildings.map((b) => <option key={b} value={b}>{b}</option>)}
        </Select>
      </div>

      {/* Step 2: Floor */}
      <div className={stepClass(!!building)}>
        <Select
          value={floor}
          onChange={(e) => { setFloor(e.target.value); setRoom(''); onChange(0, ''); }}
          placeholder="Select floor"
          disabled={!building}
        >
          {floors.map((f) => <option key={f} value={f}>{f}</option>)}
        </Select>
      </div>

      {/* Step 3: Room */}
      <div className={stepClass(!!building && !!floor)}>
        <Select
          value={room}
          onChange={(e) => handleRoomChange(e.target.value)}
          placeholder="Select room"
          disabled={!building || !floor}
        >
          {rooms.map((r) => <option key={r.id} value={r.room}>{r.room}</option>)}
        </Select>
      </div>

      {building && floor && room && (
        <div className="flex items-center gap-1.5 text-xs text-moss animate-fade-in">
          <DoorOpen className="w-3.5 h-3.5" />
          <span>Location confirmed: {building} · {floor} · {room}</span>
        </div>
      )}
    </div>
  );
}
