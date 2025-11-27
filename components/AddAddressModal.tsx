"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddAddressModal({
  email,
  onSaved,
  children,
}: {
  email: string;
  onSaved?: (a: any) => void;
  children: React.ReactNode;
}) {
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    default: false,
  });

  const update = (key: any, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(e: any) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/address", {
      method: "POST",
      body: JSON.stringify({ ...form, email }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed");
      setSaving(false);
      return;
    }

    onSaved?.(data.address);
    setSaving(false);

    setForm({
      name: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      default: false,
    });
  }

  return (
    <Dialog>
      {/* TURN ANY BUTTON INTO TRIGGER */}
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Address</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Address Name</Label>
            <Input
              required
              placeholder="Home / Work"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>

          <div>
            <Label>Street Address</Label>
            <Input
              required
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <Label>City</Label>
              <Input
                required
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
              />
            </div>

            <div className="flex-1">
              <Label>State</Label>
              <Input
                required
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Zip Code</Label>
            <Input
              required
              value={form.zip}
              onChange={(e) => update("zip", e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={form.default}
              onChange={(e) => update("default", e.target.checked)}
            />
            Set as default
          </label>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Saving..." : "Save Address"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
