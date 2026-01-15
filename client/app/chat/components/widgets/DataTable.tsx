"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { TableData } from './../../types'; 
import { cn } from "@/lib/index";

export const DataTable = ({ data }: { data: TableData }) => {
  return (
    <Card className="overflow-hidden border border-white/10 bg-black/40 shadow-2xl mt-2 w-full py-0">
      <div className="max-h-75 overflow-y-auto custom-scrollbar relative"> 
        {/* 'relative' ensures the sticky header knows its boundary */}
        <Table>
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="border-b border-primary/20">
              {data.headers.map((header, i) => (
                <TableHead key={i} className="p-0 h-10">
                  <div
                    className={cn(
                      "h-full px-4 flex items-center bg-black/60 backdrop-blur-md",
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
            {data.rows.map((row, i) => (
              <TableRow 
                key={i} 
                className="border-white/5 even:bg-white/5 hover:bg-primary/10 transition-colors duration-200 group"
              >
                {row.map((cell, j) => (
                   <TableCell 
                        key={j} 
                        className="font-mono text-xs text-gray-300 group-hover:text-white group-hover:font-bold transition-all duration-100"
                   >
                     {cell}
                   </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};