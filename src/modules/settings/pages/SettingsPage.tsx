
import { useState } from "react";
import {
  Settings,
  Building2,
  Bell,
  Shield,
  Users,
  Globe,
  Palette,
  Save,
//   User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Monitor,
  Sun,
  Moon,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const initialCompany = {
  name: "NBridge Overseas",
  email: "info@nbridge.com",
  phone: "+880 1700-000000",
  address: "Dhaka, Bangladesh",
  website: "https://nbridge.com",
};

const initialMembers = [
  {
    id: 1,
    name: "Reaz Ahmed",
    email: "reaz@nbridge.com",
    role: "Owner",
    initials: "RA",
  },
  {
    id: 2,
    name: "Abdul Karim",
    email: "karim@nbridge.com",
    role: "Admin",
    initials: "AK",
  },
  {
    id: 3,
    name: "Mohammad Hasan",
    email: "hasan@nbridge.com",
    role: "Manager",
    initials: "MH",
  },
  {
    id: 4,
    name: "Rahim Uddin",
    email: "rahim@nbridge.com",
    role: "Staff",
    initials: "RU",
  },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const [company, setCompany] = useState(initialCompany);

  const [appearance, setAppearance] = useState("system");

  const [notifications, setNotifications] = useState({
    email: true,
    system: true,
    taskUpdates: true,
    candidateUpdates: true,
    leadUpdates: false,
    weeklyReport: true,
  });

  const [localization, setLocalization] = useState({
    language: "en",
    currency: "BDT",
    dateFormat: "DD MMM YYYY",
    timezone: "Asia/Dhaka",
  });

  const [members, setMembers] = useState(initialMembers);

  const [saved, setSaved] = useState(false);

  const updateNotification = (
    key: keyof typeof notifications,
    value: boolean
  ) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const updateMemberRole = (id: number, role: string) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === id ? { ...member, role } : member
      )
    );
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const SettingRow = ({
    title,
    description,
    checked,
    onCheckedChange,
  }: {
    title: string;
    description: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
  }) => (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="size-5 text-muted-foreground" />
            <h1 className="text-2xl font-semibold tracking-tight">
              Settings
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your workspace, preferences and organization settings.
          </p>
        </div>

        <Button onClick={handleSave}>
          {saved ? (
            <>
              <Check className="mr-2 size-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="mr-2 size-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Settings Layout */}
      <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
        {/* Sidebar Navigation */}
        <Card className="h-fit shadow-none">
          <CardContent className="p-2">
            <div className="space-y-1">
              {[
                { id: "general", label: "General", icon: Building2 },
                { id: "appearance", label: "Appearance", icon: Palette },
                { id: "notifications", label: "Notifications", icon: Bell },
                { id: "team", label: "Team & Roles", icon: Users },
                { id: "security", label: "Security", icon: Shield },
                { id: "localization", label: "Localization", icon: Globe },
              ].map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="hidden">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="localization">Localization</TabsTrigger>
            </TabsList>

            {/* General */}
            <TabsContent value="general" className="mt-0 space-y-5">
              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">
                    Organization Information
                  </CardTitle>
                  <CardDescription>
                    Basic information about your organization.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="flex size-16 items-center justify-center rounded-xl border bg-muted">
                      <Building2 className="size-7 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{company.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Organization profile
                      </p>
                      <Button variant="link" className="h-auto p-0 text-xs">
                        Change logo
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input
                        value={company.name}
                        onChange={(e) => {
                          setCompany({ ...company, name: e.target.value });
                          setSaved(false);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Company Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          className="pl-9"
                          value={company.email}
                          onChange={(e) => {
                            setCompany({ ...company, email: e.target.value });
                            setSaved(false);
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          className="pl-9"
                          value={company.phone}
                          onChange={(e) => {
                            setCompany({ ...company, phone: e.target.value });
                            setSaved(false);
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Website</Label>
                      <Input
                        value={company.website}
                        onChange={(e) => {
                          setCompany({ ...company, website: e.target.value });
                          setSaved(false);
                        }}
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label>Office Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 size-4 text-muted-foreground" />
                        <Input
                          className="pl-9"
                          value={company.address}
                          onChange={(e) => {
                            setCompany({ ...company, address: e.target.value });
                            setSaved(false);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Workspace</CardTitle>
                  <CardDescription>
                    Workspace information and account preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Workspace Status</p>
                      <p className="text-xs text-muted-foreground">
                        Your organization is currently active.
                      </p>
                    </div>
                    <Badge className="bg-emerald-600">Active</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Workspace Plan</p>
                      <p className="text-xs text-muted-foreground">
                        Current subscription plan.
                      </p>
                    </div>
                    <Badge variant="secondary">Demo Plan</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance */}
            <TabsContent value="appearance" className="mt-0">
              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Appearance</CardTitle>
                  <CardDescription>
                    Customize how NBridge looks on your device.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <Label>Theme Preference</Label>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Choose your preferred application appearance.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { id: "light", label: "Light", icon: Sun },
                      { id: "dark", label: "Dark", icon: Moon },
                      { id: "system", label: "System", icon: Monitor },
                    ].map((theme) => {
                      const Icon = theme.icon;
                      const active = appearance === theme.id;

                      return (
                        <button
                          key={theme.id}
                          onClick={() => {
                            setAppearance(theme.id);
                            setSaved(false);
                          }}
                          className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                            active
                              ? "border-primary bg-muted"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <Icon className="size-5 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {theme.label}
                          </span>
                          {active && (
                            <Check className="ml-auto size-4 text-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <Separator />

                  <SettingRow
                    title="Compact Interface"
                    description="Use a more compact layout for workspace content."
                    checked={false}
                    onCheckedChange={() => setSaved(false)}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications" className="mt-0">
              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Control which updates you receive.
                  </CardDescription>
                </CardHeader>

                <CardContent className="divide-y">
                  <SettingRow
                    title="Email Notifications"
                    description="Receive important updates through email."
                    checked={notifications.email}
                    onCheckedChange={(v) => updateNotification("email", v)}
                  />
                  <SettingRow
                    title="System Notifications"
                    description="Show notifications inside the application."
                    checked={notifications.system}
                    onCheckedChange={(v) => updateNotification("system", v)}
                  />
                  <SettingRow
                    title="Task Updates"
                    description="Get notified about task assignments and completion."
                    checked={notifications.taskUpdates}
                    onCheckedChange={(v) => updateNotification("taskUpdates", v)}
                  />
                  <SettingRow
                    title="Candidate Updates"
                    description="Receive notifications when candidate records change."
                    checked={notifications.candidateUpdates}
                    onCheckedChange={(v) =>
                      updateNotification("candidateUpdates", v)
                    }
                  />
                  <SettingRow
                    title="Lead Updates"
                    description="Receive updates about new and existing leads."
                    checked={notifications.leadUpdates}
                    onCheckedChange={(v) => updateNotification("leadUpdates", v)}
                  />
                  <SettingRow
                    title="Weekly Reports"
                    description="Receive a weekly business summary."
                    checked={notifications.weeklyReport}
                    onCheckedChange={(v) => updateNotification("weeklyReport", v)}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team */}
            <TabsContent value="team" className="mt-0">
              <Card className="shadow-none">
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-base">
                        Team Members
                      </CardTitle>
                      <CardDescription>
                        Manage workspace members and their roles.
                      </CardDescription>
                    </div>
                    <Button size="sm" variant="outline">
                      <Users className="mr-2 size-4" />
                      Invite Member
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-1">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-col gap-3 rounded-lg border-b py-4 last:border-0 sm:flex-row sm:items-center"
                    >
                      <Avatar>
                        <AvatarFallback>{member.initials}</AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.email}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {member.role === "Owner" ? (
                          <Badge variant="secondary">Owner</Badge>
                        ) : (
                          <Select
                            value={member.role}
                            onValueChange={(value) =>
                              updateMemberRole(member.id, value)
                            }
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Admin">Admin</SelectItem>
                              <SelectItem value="Manager">Manager</SelectItem>
                              <SelectItem value="Staff">Staff</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  ))}

                  <p className="pt-3 text-xs text-muted-foreground">
                    Demo team data. Role changes are not saved to the database.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security */}
            <TabsContent value="security" className="mt-0 space-y-5">
              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">
                    Account Security
                  </CardTitle>
                  <CardDescription>
                    Manage your password and account protection.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg border bg-muted/40 p-3">
                      <Lock className="size-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Password</p>
                      <p className="text-xs text-muted-foreground">
                        Keep your account secure with a strong password.
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Change Password
                    </Button>
                  </div>

                  <Separator />

                  <SettingRow
                    title="Two-Factor Authentication"
                    description="Add another layer of security to your account."
                    checked={false}
                    onCheckedChange={() => setSaved(false)}
                  />

                  <Separator />

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Active Sessions</p>
                      <p className="text-xs text-muted-foreground">
                        Review devices currently signed in.
                      </p>
                    </div>
                    <Badge variant="secondary">1 Active Session</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive/30 shadow-none">
                <CardHeader>
                  <CardTitle className="text-base text-destructive">
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Actions that affect your account and workspace.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium">Delete Workspace</p>
                    <p className="text-xs text-muted-foreground">
                      Permanently remove this organization and its data.
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" disabled>
                    Delete Workspace
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Localization */}
            <TabsContent value="localization" className="mt-0">
              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">
                    Language & Region
                  </CardTitle>
                  <CardDescription>
                    Configure your workspace regional preferences.
                  </CardDescription>
                </CardHeader>

                <CardContent className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select
                      value={localization.language}
                      onValueChange={(v) => {
                        setLocalization((p) => ({ ...p, language: v }));
                        setSaved(false);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="bn">বাংলা</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select
                      value={localization.currency}
                      onValueChange={(v) => {
                        setLocalization((p) => ({ ...p, currency: v }));
                        setSaved(false);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BDT">BDT - Bangladeshi Taka</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                        <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                        <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select
                      value={localization.dateFormat}
                      onValueChange={(v) => {
                        setLocalization((p) => ({ ...p, dateFormat: v }));
                        setSaved(false);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD MMM YYYY">10 Nov 2026</SelectItem>
                        <SelectItem value="MM/DD/YYYY">11/10/2026</SelectItem>
                        <SelectItem value="YYYY-MM-DD">2026-11-10</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select
                      value={localization.timezone}
                      onValueChange={(v) => {
                        setLocalization((p) => ({ ...p, timezone: v }));
                        setSaved(false);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Dhaka">Asia/Dhaka</SelectItem>
                        <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                        <SelectItem value="Asia/Riyadh">Asia/Riyadh</SelectItem>
                        <SelectItem value="Asia/Dubai">Asia/Dubai</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
