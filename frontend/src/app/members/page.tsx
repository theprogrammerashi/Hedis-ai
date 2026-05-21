"use client";

import { useEffect, useState, Suspense } from "react";
import { fetchMembers } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, Home, Languages, Eye } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function MembersList() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search");
  
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMeasure, setFilterMeasure] = useState("ALL");
  const [filterGap, setFilterGap] = useState("ALL");

  const loadMembers = () => {
    setLoading(true);
    let params: any = {};
    if (filterMeasure !== "ALL") params.measure = filterMeasure;
    if (filterGap !== "ALL") params.compliant = filterGap;
    if (searchQuery) params.search = searchQuery;
    
    fetchMembers(params).then((data) => {
      setMembers(data.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadMembers();
  }, [filterMeasure, filterGap, searchQuery]);

  const getRowColor = (gap: string, followup: string) => {
    if (gap === "YES") return "bg-green-50/50 hover:bg-green-50 transition-colors";
    if (gap === "NO" && followup === "N") return "bg-red-50/50 hover:bg-red-50 transition-colors";
    if (gap === "NO" && followup === "Y") return "bg-amber-50/50 hover:bg-amber-50 transition-colors";
    return "transition-colors hover:bg-slate-50";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Members Directory</h1>
          {searchQuery && <p className="text-sm text-slate-500 mt-1">Showing results for: <span className="font-medium text-blue-600">"{searchQuery}"</span></p>}
        </div>
        <div className="flex gap-4">
          <Select value={filterMeasure} onValueChange={(val) => setFilterMeasure(val!)}>
            <SelectTrigger className="w-[180px] bg-white shadow-sm border-slate-200">
              <SelectValue placeholder="Measure">
                {filterMeasure === 'ALL' ? 'All Measures' : filterMeasure}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Measures</SelectItem>
              <SelectItem value="OMW">OMW</SelectItem>
              <SelectItem value="SPC">SPC</SelectItem>
              <SelectItem value="COL">COL</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterGap} onValueChange={(val) => setFilterGap(val!)}>
            <SelectTrigger className="w-[180px] bg-white shadow-sm border-slate-200">
              <SelectValue placeholder="Gap Status">
                {filterGap === 'ALL' ? 'All Status' : filterGap === 'NO' ? 'Gap Open' : 'Compliant'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="NO">Gap Open</SelectItem>
              <SelectItem value="YES">Compliant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/80 backdrop-blur-sm">
            <TableRow className="border-b border-slate-200">
              <TableHead className="font-semibold text-slate-700 h-12">Member ID</TableHead>
              <TableHead className="font-semibold text-slate-700 h-12">Name</TableHead>
              <TableHead className="font-semibold text-slate-700 h-12">Measure</TableHead>
              <TableHead className="font-semibold text-slate-700 h-12">Gap Status</TableHead>
              <TableHead className="font-semibold text-slate-700 h-12">Follow-Up</TableHead>
              <TableHead className="font-semibold text-slate-700 h-12">SDOH Profile</TableHead>
              <TableHead className="text-right font-semibold text-slate-700 h-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-12 text-slate-500 font-medium">Loading directory...</TableCell></TableRow>
            ) : members.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-12 text-slate-500">No members found matching your criteria.</TableCell></TableRow>
            ) : members.map((m: any, idx: number) => (
              <TableRow key={`${m.id_normalized}-${m.measure}-${idx}`} className={getRowColor(m.compliant, m.follow_up)}>
                <TableCell className="font-semibold text-slate-900">{m.profile_member_id}</TableCell>
                <TableCell className="font-medium text-slate-700">{m.member_name}</TableCell>
                <TableCell><Badge variant="outline" className="bg-white">{m.measure}</Badge></TableCell>
                <TableCell>
                  {m.compliant === "NO" ? (
                    <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-200 border-none font-medium shadow-sm">Gap Open</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 border-none">Compliant</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {m.follow_up === "Y" ? (
                    <Badge variant="outline" className="text-slate-600 border-slate-300 bg-white shadow-sm">Done</Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 shadow-sm">Pending</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2.5 text-slate-400">
                    <span title={`Transport: ${m.transportation_access}`} className={m.transportation_access === 'N' ? 'text-red-500 animate-pulse' : ''}>
                      <Car className="w-[18px] h-[18px]" />
                    </span>
                    <span title={`Housing: ${m.housing_status}`} className={m.housing_status === 'N' ? 'text-red-500 animate-pulse' : ''}>
                      <Home className="w-[18px] h-[18px]" />
                    </span>
                    <span title={`Language: ${m.primary_language}`} className={m.primary_language !== 'English' ? 'text-blue-500' : ''}>
                      <Languages className="w-[18px] h-[18px]" />
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/members/${m.id_normalized}`}>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-medium">
                      <Eye className="w-4 h-4 mr-2" /> View 360
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function Members() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Members...</div>}>
      <MembersList />
    </Suspense>
  );
}
