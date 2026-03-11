import React from 'react';
import { Zap } from 'lucide-react';

export default function CloudModelCard({ model, isActive, onActivate }: any) {
  return (
    <div className={`p-5 rounded-xl border transition-all flex flex-col gap-3 ${isActive ? 'border-primary bg-primary/5' : 'border-border bg-card/50 hover:border-accent/30'}`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg">{model.name}</h3>
            {model.provider === 'Groq' && <Zap size={14} className="text-orange-500 fill-orange-500" />}
          </div>
          <p className="text-xs text-accent font-mono mt-1">{model.provider}</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{model.description}</p>
      
      <div className="pt-2">
        <button 
          onClick={() => onActivate(model)}
          className={`w-full py-2 rounded-lg text-sm font-bold transition-colors ${
            isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {isActive ? 'Current Cloud Model' : 'Use this Model'}
        </button>
      </div>
    </div>
  );
}