import React from 'react';
import { Card, CardContent, Typography, Grid, List, ListItem, ListItemText } from '@mui/material';

const Dashboard = ({ receipts }) => {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={2}>
        {receipts.map((receipt, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  {receipt.merchantName}
                </Typography>
                <List>
                  {receipt.items.map((item, idx) => (
                    <ListItem key={idx}>
                      <ListItemText
                        primary={item.name}
                        secondary={`Price: $${item.price.toFixed(2)} x Quantity: ${item.quantity}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Dashboard;
