"use client"

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TableData } from './../../types'; 
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 5;

export const DataTable = ({ data }: { data: TableData }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Normalize rows first (Handle the Array vs Object issue from AI)
  const normalizedRows = data.rows.map((row) => {
    if (Array.isArray(row)) {
      return row;
    } else if (typeof row === 'object' && row !== null) {
      // Map dictionary back to array based on headers
      // @ts-ignore - allowing dynamic access for the fallback logic
      return data.headers.map(header => row[header] || "");
    }
    return [];
  });

  // 2. Calculate Pagination Logic
  const totalPages = Math.ceil(normalizedRows.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentRows = normalizedRows.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  return (
    <Card className="overflow-hidden gap-2 border border-white/10 bg-black/40 shadow-2xl mt-2 w-full py-0 flex flex-col">
      {/* RESPONSIVE: Added overflow-x-auto to wrapper to enable horizontal scroll on mobile */}
      <div className="relative w-full overflow-x-auto"> 
        
        {/* RESPONSIVE: Added min-w-[600px] to force scroll on small screens instead of squishing */}
        <Table className="min-w-150 md:min-w-full custom-scrollbar">
          <TableHeader>
            <TableRow className="border-b border-primary/20 hover:bg-transparent">
              {data.headers.map((header, i) => (
                <TableHead key={i} className="p-0 h-10">
                  <div
                    className={cn(
                      "h-full px-4 flex items-center bg-black/60 backdrop-blur-md text-xs font-black uppercase tracking-widest text-primary whitespace-nowrap",
                      i === 0 && "rounded-tl-xl",
                      i === data.headers.length - 1 && "rounded-tr-xl"
                    )}
                  >
                    {header}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {currentRows.map((row, i) => (
              <TableRow 
                key={i} 
                className="border-white/5 even:bg-white/5 hover:bg-primary/10 transition-colors duration-200 group"
              >
                {row.map((cell, j) => (
                  <TableCell 
                    key={j} 
                    className="font-mono text-xs text-gray-300 group-hover:text-white group-hover:font-bold transition-all duration-100 py-3 whitespace-nowrap"
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            
            {/* Empty State Filler: Keeps table height consistent if last page has fewer items */}
            {currentRows.length < ITEMS_PER_PAGE && 
              Array.from({ length: ITEMS_PER_PAGE - currentRows.length }).map((_, idx) => (
                <TableRow key={`empty-${idx}`} className="border-transparent hover:bg-transparent">
                  <TableCell colSpan={data.headers.length} className="h-11.25" />
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 bg-black/20">
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                Page {currentPage} of {totalPages}
            </span>
            
            <div className="flex items-center gap-1">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handlePrev} 
                    disabled={currentPage === 1}
                    className="h-7 w-7 text-muted-foreground hover:text-primary border border-transparent hover:bg-muted/10! hover:border-primary disabled:opacity-30 transition-colors"
                >
                    <ChevronLeft size={14} />
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleNext} 
                    disabled={currentPage === totalPages}
                    className="h-7 w-7 text-muted-foreground hover:text-primary border border-transparent hover:bg-muted/10! hover:border-primary disabled:opacity-30 transition-colors"
                >
                    <ChevronRight size={14} />
                </Button>
            </div>
        </div>
      )}
    </Card>
  );
};