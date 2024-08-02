import React from 'react';
import { useDropzone } from 'react-dropzone';
import Tesseract from 'tesseract.js';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';

const parseReceipt = async (file) => {
  const { data: { text } } = await Tesseract.recognize(
    file,
    'eng',
    {
      logger: (m) => console.log(m),
    }
  );

  console.log("OCR Result:", text);

  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  // Find the merchant name (first non-empty line)
  const merchantName = lines[0];
  console.log("Merchant Name:", merchantName);

  // Extract items
  const items = [];
  const itemRegex = /^(.*?)\s+(\d+\.\d{2})\s+X\s+(\d+(\.\d+)?)$/;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(itemRegex);
    if (match) {
      items.push({
        name: match[1],
        price: parseFloat(match[2]),
        quantity: parseFloat(match[3]),
      });
    }
  }

  console.log("Items:", items);

  return { merchantName, items };
};

const ReceiptForm = ({ addReceipt }) => {
  const [loading, setLoading] = React.useState(false);

  const onDrop = async (acceptedFiles) => {
    setLoading(true);
    const file = acceptedFiles[0];
    const receipt = await parseReceipt(file);
    addReceipt(receipt);
    setLoading(false);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <Box my={2}>
      <Typography variant="h5" gutterBottom>
        Upload Receipt
      </Typography>
      <Paper {...getRootProps()} style={{ border: '1px solid black', padding: '20px', cursor: 'pointer' }}>
        <input {...getInputProps()} />
        <Typography variant="body1">
          Drag 'n' drop a receipt here, or click to select one
        </Typography>
        {loading && <CircularProgress />}
      </Paper>
    </Box>
  );
};

export default ReceiptForm;
