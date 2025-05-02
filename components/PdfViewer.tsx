import React from "react";

type Props = { pdfUrl: string };

const PdfViewer = ({ pdfUrl }: Props) => {
  return (
    <iframe
      src={`https://docs.google.com/gview?url=${pdfUrl}&embedded=true`}
      frameBorder="0"
      className="w-full h-full"
    />
  );
};

export default PdfViewer;
