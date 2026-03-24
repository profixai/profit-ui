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
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="bg-primary/5 border border-primary/15 rounded-lg p-4 mt-3 flex gap-3">
          <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-foreground leading-relaxed">
            <p dangerouslySetInnerHTML={{ __html: content }} />
            {onFollowUp && (
              <button
                onClick={onFollowUp}
                className="text-xs text-primary font-medium mt-2 hover:underline"
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
