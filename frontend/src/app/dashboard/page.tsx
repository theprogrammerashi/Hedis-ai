"use client";

import { useEffect, useState } from "react";
import { fetchKPIs, fetchCharts } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertCircle, PhoneMissed, CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [kpis, setKpis] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchKPIs(), fetchCharts()]).then(([kpiData, chartData]) => {
      setKpis(kpiData);
      setCharts(chartData);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;

  const COLORS = ['#2563EB', '#10B981', '#F97316', '#8B5CF6'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <Card className="hover:shadow-md transition-shadow bg-gradient-to-br from-orange-50 to-white border-orange-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-900">Critical Priority Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900">{kpis?.priority_alerts?.length || 0}</div>
            <p className="text-xs text-slate-600 mt-1 font-medium leading-tight">
              Gaps open, no follow-up,<br/>no transport.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Members</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{kpis?.total_members}</div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Care Gaps Open</CardTitle>
            <AlertCircle className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{kpis?.care_gaps_open}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Follow-Up Pending</CardTitle>
            <PhoneMissed className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{kpis?.follow_up_pending}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">SMS Auto-Sent</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{kpis?.sms_auto_sent}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-slate-900">Members by Measure</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={charts?.members_by_measure}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="measure"
                  label={({name}: any) => name}
                >
                  {charts?.members_by_measure.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-slate-900">Compliance Rate by Measure (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={charts?.compliance_rate}>
                <XAxis dataKey="measure" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rate" fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Analytics & Insights Section */}
      <div className="pt-6 border-t border-slate-200 mt-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Analytics & Insights</h2>
            <p className="text-slate-500 text-sm mt-1">SDOH breakdown, outreach effectiveness, and care gap trends</p>
          </div>
          <Button variant="outline" className="bg-white border-slate-200 text-slate-900 shadow-sm flex items-center gap-2 font-medium">
            <Download className="w-4 h-4" /> Export Report
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Language Distribution */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900">Language Distribution</CardTitle>
              <p className="text-sm text-slate-500">Primary language of enrolled members</p>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {charts?.language_distribution?.map((item: any, idx: number) => {
                const colors = ['bg-sky-500', 'bg-emerald-600', 'bg-amber-500', 'bg-violet-600', 'bg-slate-500'];
                const color = colors[idx % colors.length];
                const maxCount = Math.max(...(charts?.language_distribution?.map((i: any) => i.count) || [1]));
                const width = `${Math.max((item.count / maxCount) * 100, 2)}%`;
                
                return (
                  <div key={idx} className="flex items-center text-sm">
                    <div className="w-24 text-slate-600 truncate">{item.language}</div>
                    <div className="flex-1 flex items-center">
                      <div className="w-full bg-orange-100 rounded-full h-3 overflow-hidden relative">
                        <div className={`h-full rounded-full ${color}`} style={{ width }} />
                      </div>
                    </div>
                    <div className="w-8 text-right font-bold text-slate-900">{item.count}</div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* SDOH Risk Factors */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900">SDOH Risk Factors</CardTitle>
              <p className="text-sm text-slate-500">Social determinants affecting care access</p>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {charts?.sdoh_factors?.map((item: any, idx: number) => {
                const colors = ['bg-sky-500', 'bg-amber-500', 'bg-violet-600', 'bg-emerald-600'];
                const color = colors[idx % colors.length];
                const maxCount = Math.max(...(charts?.sdoh_factors?.map((i: any) => i.count) || [1]));
                const width = `${Math.max((item.count / maxCount) * 100, 2)}%`;

                return (
                  <div key={idx} className="flex items-center text-sm">
                    <div className="w-24 text-slate-600 truncate pr-2 leading-tight">{item.factor}</div>
                    <div className="flex-1 flex items-center">
                      <div className="w-full bg-orange-100 rounded-full h-3 overflow-hidden relative">
                        <div className={`h-full rounded-full ${color}`} style={{ width }} />
                      </div>
                    </div>
                    <div className="w-8 text-right font-bold text-slate-900">{item.count}</div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Outreach Effectiveness */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-900">Outreach Effectiveness</CardTitle>
            <p className="text-sm text-slate-500">Simulated monthly care gap closure trend</p>
          </CardHeader>
          <CardContent className="pt-8 pb-4">
            <div className="flex items-end h-[120px] gap-2 w-full">
              {charts?.outreach_effectiveness?.map((item: any, idx: number) => {
                const maxVal = 100;
                const height = `${(item.value / maxVal) * 100}%`;
                // Generate progressively darker blue colors
                const opacities = ['bg-slate-100', 'bg-slate-200', 'bg-slate-300', 'bg-slate-400', 'bg-slate-500'];
                const bgColor = opacities[idx % opacities.length];
                
                return (
                  <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end group">
                    <div 
                      className={`w-full rounded-t-sm ${bgColor} transition-all duration-300 group-hover:opacity-90`}
                      style={{ height }}
                    />
                    <div className="text-xs text-slate-500 mt-3 font-medium">{item.month}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
