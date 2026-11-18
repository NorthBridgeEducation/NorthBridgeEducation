
import { useMemo, useState, type FormEvent } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock3,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Search,
  CalendarDays,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type TransactionType = "Income" | "Expense";
type TransactionStatus = "Paid" | "Pending";

type Transaction = {
  id: string;
  title: string;
  category: string;
  candidate: string;
  date: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  method: string;
};

const initialTransactions: Transaction[] = [
  {
    id: "TRX-1028",
    title: "Application processing fee",
    category: "Service Fee",
    candidate: "Ahmed Rahman",
    date: "Nov 10, 2026",
    amount: 15000,
    type: "Income",
    status: "Paid",
    method: "Bank Transfer",
  },
  {
    id: "TRX-1027",
    title: "Office monthly rent",
    category: "Office Rent",
    candidate: "—",
    date: "Nov 09, 2026",
    amount: 35000,
    type: "Expense",
    status: "Paid",
    method: "Bank Transfer",
  },
  {
    id: "TRX-1026",
    title: "Visa processing service",
    category: "Visa Service",
    candidate: "Nusrat Jahan",
    date: "Nov 08, 2026",
    amount: 25000,
    type: "Income",
    status: "Pending",
    method: "Cash",
  },
  {
    id: "TRX-1025",
    title: "Staff salary",
    category: "Salary",
    candidate: "—",
    date: "Nov 07, 2026",
    amount: 55000,
    type: "Expense",
    status: "Paid",
    method: "Bank Transfer",
  },
  {
    id: "TRX-1024",
    title: "Document verification",
    category: "Service Fee",
    candidate: "Tanvir Hasan",
    date: "Nov 06, 2026",
    amount: 8500,
    type: "Income",
    status: "Paid",
    method: "Cash",
  },
  {
    id: "TRX-1023",
    title: "Internet and utilities",
    category: "Utilities",
    candidate: "—",
    date: "Nov 05, 2026",
    amount: 6200,
    type: "Expense",
    status: "Pending",
    method: "Mobile Banking",
  },
  {
    id: "TRX-1022",
    title: "Consultation fee",
    category: "Consultation",
    candidate: "Sadia Islam",
    date: "Nov 04, 2026",
    amount: 5000,
    type: "Income",
    status: "Paid",
    method: "Cash",
  },
];

const money = (amount: number) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);

const tabs = ["Overview", "Income", "Expenses", "Transactions"] as const;
type FinanceTab = (typeof tabs)[number];

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof Wallet;
}) {
  return (
    <Card className="gap-3 py-5 shadow-none">
      <CardContent className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <p className="text-2xl font-semibold tracking-tight">
            {value}
          </p>
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="flex size-10 items-center justify-center rounded-lg border bg-muted/50">
          <Icon className="size-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: TransactionStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
        status === "Paid"
          ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300"
      }`}
    >
      {status}
    </span>
  );
}

export function FinancePage() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [activeTab, setActiveTab] = useState<FinanceTab>("Overview");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState<"All" | TransactionType>("All");

  const [form, setForm] = useState({
    title: "",
    category: "Service Fee",
    candidate: "",
    amount: "",
    type: "Income" as TransactionType,
    method: "Cash",
    status: "Paid" as TransactionStatus,
  });

  // Financial summary
  const totals = useMemo(() => {
    const income = transactions
      .filter((item) => item.type === "Income")
      .reduce((sum, item) => sum + item.amount, 0);

    const expenses = transactions
      .filter((item) => item.type === "Expense")
      .reduce((sum, item) => sum + item.amount, 0);

    const pending = transactions
      .filter((item) => item.status === "Pending")
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      income,
      expenses,
      profit: income - expenses,
      pending,
    };
  }, [transactions]);

  // Search and filters
  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((item) => {
      const matchesSearch =
        !query ||
        [
          item.id,
          item.title,
          item.category,
          item.candidate,
          item.method,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesType =
        typeFilter === "All" || item.type === typeFilter;

      const matchesTab =
        activeTab === "Income"
          ? item.type === "Income"
          : activeTab === "Expenses"
            ? item.type === "Expense"
            : true;

      return matchesSearch && matchesType && matchesTab;
    });
  }, [transactions, search, typeFilter, activeTab]);

  // Add transaction
  function handleAddTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amount = Number(form.amount);

    if (!amount || amount <= 0) return;

    const newItem: Transaction = {
      id: `TRX-${String(Date.now()).slice(-6)}`,
      title: form.title.trim(),
      category: form.category,
      candidate: form.candidate.trim() || "—",
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      amount,
      type: form.type,
      status: form.status,
      method: form.method,
    };

    setTransactions((current) => [newItem, ...current]);

    setForm({
      title: "",
      category: "Service Fee",
      candidate: "",
      amount: "",
      type: "Income",
      method: "Cash",
      status: "Paid",
    });

    setShowForm(false);
    setActiveTab("Transactions");
    setSearch("");
    setTypeFilter("All");
  }

  const visibleTransactions =
    activeTab === "Overview"
      ? filteredTransactions.slice(0, 5)
      : filteredTransactions;

  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wallet className="size-4" />
            Management
            <span>/</span>
            <span className="text-foreground">Finance</span>
          </div>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Finance
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Track income, expenses and your business cash flow.
          </p>
        </div>

        <Button onClick={() => setShowForm((value) => !value)}>
          {showForm ? <X /> : <Plus />}
          {showForm ? "Close" : "Add transaction"}
        </Button>
      </div>

      {/* Financial statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total income"
          value={money(totals.income)}
          description="All recorded income"
          icon={TrendingUp}
        />

        <StatCard
          title="Total expenses"
          value={money(totals.expenses)}
          description="All recorded expenses"
          icon={TrendingDown}
        />

        <StatCard
          title="Net balance"
          value={money(totals.profit)}
          description="Income minus expenses"
          icon={Wallet}
        />

        <StatCard
          title="Pending payments"
          value={money(totals.pending)}
          description="Awaiting settlement"
          icon={Clock3}
        />
      </div>

      {/* Add transaction form */}
      {showForm && (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">
              Add transaction
            </CardTitle>
            <CardDescription>
              Record a demo income or expense.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleAddTransaction}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Transaction type
                  </label>

                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form.type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        type: e.target.value as TransactionType,
                        category:
                          e.target.value === "Income"
                            ? "Service Fee"
                            : "Office Rent",
                      })
                    }
                  >
                    <option>Income</option>
                    <option>Expense</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Description
                  </label>

                  <Input
                    required
                    placeholder="Transaction description"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Category
                  </label>

                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    {(form.type === "Income"
                      ? [
                          "Service Fee",
                          "Visa Service",
                          "Consultation",
                          "Other Income",
                        ]
                      : [
                          "Office Rent",
                          "Salary",
                          "Utilities",
                          "Transport",
                          "Marketing",
                          "Other Expense",
                        ]
                    ).map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Amount (BDT)
                  </label>

                  <Input
                    required
                    min="1"
                    type="number"
                    placeholder="0"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Candidate / Payee
                  </label>

                  <Input
                    placeholder="Optional"
                    value={form.candidate}
                    onChange={(e) =>
                      setForm({ ...form, candidate: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Payment method
                  </label>

                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form.method}
                    onChange={(e) =>
                      setForm({ ...form, method: e.target.value })
                    }
                  >
                    <option>Cash</option>
                    <option>Bank Transfer</option>
                    <option>Mobile Banking</option>
                    <option>Card</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Payment status
                  </label>

                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as TransactionStatus,
                      })
                    }
                  >
                    <option>Paid</option>
                    <option>Pending</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>

                <Button type="submit">
                  <Plus className="size-4" />
                  Save transaction
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Transactions */}
      <Card className="gap-0 overflow-hidden py-0 shadow-none">
        <CardHeader className="gap-4 border-b px-5 py-5">

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="text-base">
                Financial activity
              </CardTitle>

              <CardDescription className="mt-1">
                Review and manage your recorded transactions.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="size-4" />
              November 2026
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto">
              {tabs.map((tab) => (
                <Button
                  key={tab}
                  size="sm"
                  variant={
                    activeTab === tab ? "secondary" : "ghost"
                  }
                  className="h-8 shrink-0 text-xs"
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </Button>
              ))}
            </div>

            {/* Search and filter */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative sm:w-64">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search transactions..."
                  className="pl-9"
                />
              </div>

              <select
                aria-label="Filter transaction type"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(
                    e.target.value as "All" | TransactionType
                  )
                }
              >
                <option>All</option>
                <option>Income</option>
                <option>Expense</option>
              </select>
            </div>
          </div>
        </CardHeader>

        {/* Transaction table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">
                    Transaction
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Category
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Candidate / Payee
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Date
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Method
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right font-medium">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {visibleTransactions.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                            item.type === "Income"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-rose-500/10 text-rose-600"
                          }`}
                        >
                          {item.type === "Income" ? (
                            <ArrowDownLeft className="size-4" />
                          ) : (
                            <ArrowUpRight className="size-4" />
                          )}
                        </div>

                        <div>
                          <p className="font-medium">
                            {item.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-muted-foreground">
                      {item.category}
                    </td>

                    <td className="px-4 py-3.5">
                      {item.candidate}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 text-muted-foreground">
                      {item.date}
                    </td>

                    <td className="px-4 py-3.5 text-muted-foreground">
                      {item.method}
                    </td>

                    <td className="px-4 py-3.5">
                      <StatusBadge status={item.status} />
                    </td>

                    <td
                      className={`px-5 py-3.5 text-right font-semibold tabular-nums ${
                        item.type === "Income"
                          ? "text-emerald-600"
                          : "text-foreground"
                      }`}
                    >
                      {item.type === "Expense" ? "−" : "+"}
                      {money(item.amount)}
                    </td>
                  </tr>
                ))}

                {visibleTransactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-muted">
                        <Search className="size-5 text-muted-foreground" />
                      </div>

                      <p className="mt-3 font-medium">
                        No transactions found
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Try another search or filter.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 border-t px-5 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing {visibleTransactions.length} of{" "}
              {transactions.length} transactions
            </span>

            <span>Demo data · Local state only</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
