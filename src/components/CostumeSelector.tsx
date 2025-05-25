// CostumeSelector.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Wizard Hat",
  "Astronaut Helmet",
  "Ninja",
  "Pirate",
  "Pilot",
  "Cat Suit",
  "Maid",
  "Sparkles",
  "Crown",

  // New additions
  "Flower Crown",
  "Devil Horns",
  "Angel Halo",
  "Bunny Ears",
  "Deer Antlers",
  "Top Hat",
  "Chef Hat",
  "Graduation Cap",
  "Sombrero",
  "Sunglasses",
  "Eye Patch",
  "Bow Tie",
  "Scarf",
  "Cape",
  "Armor Chestplate",
  "Butterfly Swarm",
  "Fire Aura",
  "Ice Aura",
  "Lightning Sparks",
  "Magical Glow",
  "Floating Emoji Hearts",
  "Glitch Aura",
  "Bubble Effects",
  "Rainbow Trail",
  "Cyberpunk Glow",
  "Nature Vines",
  "Snowflakes and Earmuffs",
  "Disco Lights",
];

const getRandomSelections = (count: number) => {
  const shuffled = [...SUGGESTIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

type Props = {
  onUpdatePrompt: (prompt: string) => void;
  disabled?: boolean;
};

export default function CostumeSelector({ onUpdatePrompt, disabled }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");

  const toggleChip = (item: string) => {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
    setCustomPrompt("");
  };

  const handleRandomize = () => {
    const random = getRandomSelections(3);
    setSelected(random);
    setCustomPrompt("");
    onUpdatePrompt(random.join(", "));
  };

  const handleInputChange = (text: string) => {
    setCustomPrompt(text);
    setSelected([]);
    onUpdatePrompt(text);
  };

  const handleClickChip = (item: string) => {
    toggleChip(item);
    const newSelection = selected.includes(item)
      ? selected.filter((i) => i !== item)
      : [...selected, item];
    onUpdatePrompt(newSelection.join(", "));
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="font-semibold mb-2">🎭 Quick Picks – Tap to add:</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((item) => (
            <Button
              key={item}
              variant={selected.includes(item) ? "default" : "outline"}
              size="sm"
              disabled={disabled}
              className={cn("rounded-full px-4", {
                "bg-primary text-black": selected.includes(item),
              })}
              onClick={() => handleClickChip(item)}
            >
              {item}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <p className="font-semibold mb-2">✍️ Or write your own idea:</p>
        <Input
          value={customPrompt}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="e.g. pirate with rainbow cape and floating emoji hearts"
          disabled={disabled}
        />
      </div>

      <div className="text-right">
        <Button variant="ghost" onClick={handleRandomize} disabled={disabled}>
          🎲 Randomize
        </Button>
      </div>
    </div>
  );
}
