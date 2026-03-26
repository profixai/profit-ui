import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface InlineAIRowProps {
  visible: boolean;
  content: string;
  onFollowUp?: () => void;
}

export const InlineAIRow = ({ visible, content, onFollowUp }: InlineAIRowProps) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="overflow-hidden"
      >
        <div className="bg-muted/40 border border-border rounded-lg p-3.5 mt-2.5 flex gap-3">
          <Sparkles className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
          <div className="text-xs text-foreground/80 leading-relaxed">
            <p dangerouslySetInnerHTML={{ __html: content }} />
            {onFollowUp && (
              <button
                onClick={onFollowUp}
                className="text-[11px] text-primary font-medium mt-2 hover:underline"
              >
                Ask follow-up →
              </button>
            )}
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);
