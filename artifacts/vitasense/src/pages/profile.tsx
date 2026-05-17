import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@workspace/replit-auth-web";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, Plus, Save, User } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allergyInput, setAllergyInput] = useState("");

  const [form, setForm] = useState({
    genotype: "",
    bloodGroup: "",
    sex: "",
    dateOfBirth: "",
    allergies: [] as string[],
  });

  useEffect(() => {
    fetch("/api/profile", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setForm({
          genotype: data.genotype ?? "",
          bloodGroup: data.bloodGroup ?? "",
          sex: data.sex ?? "",
          dateOfBirth: data.dateOfBirth ?? "",
          allergies: data.allergies ?? [],
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await fetch("/api/profile", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genotype: form.genotype || null,
          bloodGroup: form.bloodGroup || null,
          sex: form.sex || null,
          dateOfBirth: form.dateOfBirth || null,
          allergies: form.allergies,
        }),
      });
      if (!r.ok) throw new Error("Failed");
      toast({ title: "Profile saved", description: "Your health profile has been updated." });
    } catch {
      toast({ title: "Error saving profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const addAllergy = () => {
    const val = allergyInput.trim();
    if (val && !form.allergies.includes(val)) {
      setForm((f) => ({ ...f, allergies: [...f.allergies, val] }));
    }
    setAllergyInput("");
  };

  const removeAllergy = (a: string) => {
    setForm((f) => ({ ...f, allergies: f.allergies.filter((x) => x !== a) }));
  };

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "User"
    : "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <AppShell>
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-1">Health Profile</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Key health facts used to personalise your symptom analysis.
        </p>

        <div className="flex items-center gap-4 mb-6 p-4 bg-card rounded-xl border border-border">
          <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} className="h-14 w-14 rounded-full object-cover" alt={displayName} />
            ) : (
              initials || <User className="h-6 w-6" />
            )}
          </div>
          <div>
            <p className="font-semibold text-foreground">{displayName}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
              <CardDescription>This data helps the AI provide more accurate educational guidance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Genotype</Label>
                  <Select value={form.genotype} onValueChange={(v) => setForm((f) => ({ ...f, genotype: v }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select genotype" />
                    </SelectTrigger>
                    <SelectContent>
                      {["AA", "AS", "AC", "SS", "SC"].map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Blood Group</Label>
                  <Select value={form.bloodGroup} onValueChange={(v) => setForm((f) => ({ ...f, bloodGroup: v }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Sex</Label>
                  <Select value={form.sex} onValueChange={(v) => setForm((f) => ({ ...f, sex: v }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other / Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    className="mt-1"
                    value={form.dateOfBirth}
                    onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Allergies</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="e.g. Penicillin, Peanuts..."
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addAllergy()}
                  />
                  <Button type="button" size="icon" variant="outline" onClick={addAllergy}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {form.allergies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.allergies.map((a) => (
                      <Badge key={a} variant="secondary" className="gap-1 pr-1">
                        {a}
                        <button onClick={() => removeAllergy(a)} className="hover:text-destructive ml-1">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Profile
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
