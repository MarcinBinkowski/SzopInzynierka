import { useState } from "react";
import Monaco from "@monaco-editor/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Props = {
  value: string;
  onChange: (val: string) => void;
};

function IframePreview({ html }: { html: string }) {
  return (
    <iframe
      className="w-full min-h-[85vh] border-0"
      sandbox="allow-same-origin"
      srcDoc={html}
    />
  );
}

export default function HtmlTemplateEditor({
  value,
  onChange,
}: Props) {
  const [tab, setTab] = useState<"code" | "preview">("code");

  return (
    <div className="space-y-3 w-full">
      <Tabs
        value={tab}
        onValueChange={(v: string) => setTab(v as "code" | "preview")}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 w-48">
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="code">
          <div className="border rounded-lg overflow-hidden">
            <Monaco
              height="70vh"
              defaultLanguage="html"
              value={value}
              onChange={(v) => onChange(v ?? "")}
              options={{
                minimap: { enabled: false },
                wordWrap: "on",
                fontSize: 13,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                renderWhitespace: "selection",
                bracketPairColorization: { enabled: true },
                suggest: {
                  showKeywords: true,
                  showSnippets: true,
                },
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <div className="border rounded-lg w-full">
            <div className="px-3 py-2 text-sm text-muted-foreground bg-muted border-b">
              Preview
            </div>
            <IframePreview html={value} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
