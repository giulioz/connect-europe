import React, { useState } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";

export default function NameInsertDialog({
  open,
  onSetName,
}: {
  open: boolean;
  onSetName: (name: string) => void;
}) {
  const [value, setValue] = useState<string>("");

  return (
    <Dialog open={open}>
      <DialogTitle>Enter your name</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          fullWidth
          value={value}
          onChange={e => setValue(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button
          disabled={!value}
          onClick={() => onSetName(value)}
          color="primary"
        >
          Play
        </Button>
      </DialogActions>
    </Dialog>
  );
}
