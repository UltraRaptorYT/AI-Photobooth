"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  // Headwear
  "Wizard Hat",
  "Pirate Hat",
  "Graduation Cap",
  "Bunny Ears",
  "Sombrero",
  "Chef Hat",
  "Crown",
  "Astronaut Helmet",
  "Flower Crown",

  // Auras & Visuals
  "Fire Aura",
  "Ice Aura",
  "Lightning Sparks",
  "Magical Glow",
  "Floating Emoji Hearts",
  "Bubble Effects",
  "Sparkles",
  "Disco Lights",
  "Rainbow Trail",

  // Costumes/Props
  "Ninja",
  "Cat Costume",
  "Dripped Out Clothes",
  "Bow Tie",
  "Eye Patch",
  "Pilot",
  "Maid",
  "Sunglasses",
  "Lightsaber",
  "Cape",
  "Necklances",
  "Vintage Clothes",
  "Kimono Robe",
  "Magic Wand",

  // Wacky
  "Deal With It Glasses",
  "Shrek's Ears",
  "Pikachu's Ears",
  "Rubber Ducky",
  "Hot Dog Suit",

  // Modern
  "Gaming Headset",
  "Hacker Hoodie",
  "Cyberpunk Glow",
  "AR Glasses",

  // "Wizard Hat",
  // "Astronaut Helmet",
  // "Ninja",
  // "Pirate",
  // "Pilot",
  // "Cat Suit",
  // "Maid",
  // "Sparkles",
  // "Crown",

  // // New additions
  // "Flower Crown",
  // "Bunny Ears",
  // "Deer Antlers",
  // "Top Hat",
  // "Chef Hat",
  // "Graduation Cap",
  // "Sombrero",
  // "Sunglasses",
  // "Eye Patch",
  // "Bow Tie",
  // "Confetti Burst",
  // "Cape",
  // "Armor Chestplate",
  // "Butterfly Swarm",
  // "Fire Aura",
  // "Ice Aura",
  // "Lightning Sparks",
  // "Magical Glow",
  // "Floating Emoji Hearts",
  // "Bubble Effects",
  // "Rainbow Trail",
  // "Cyberpunk Glow",
  // "Nature Vines",
  // "Disco Lights",
  // "Gaming Headset",
  // "Drip Out Clothes",
  // "Lightsaber",
];

const getRandomSelections = (count: number) => {
  const shuffled = [...SUGGESTIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

type Props = {
  value: string;
  onUpdatePrompt: (prompt: string) => void;
  disabled?: boolean;
};

export default function CostumeSelector({
  value,
  onUpdatePrompt,
  disabled,
}: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");

  useEffect(() => {
    if (!value) {
      setSelected([]);
      setCustomPrompt("");
    }
  }, [value]);

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

      <div className="flex items-center justify-end gap-4">
        <Button
          variant="secondary"
          onClick={handleRandomize}
          disabled={disabled}
        >
          🎲 Randomize
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            setSelected([]);
            onUpdatePrompt("");
          }}
          disabled={disabled}
        >
          🧼 Clear All
        </Button>
      </div>
    </div>
  );
}
