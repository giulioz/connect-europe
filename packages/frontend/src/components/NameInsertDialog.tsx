import React, { useState } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  control: {
    minWidth: theme.spacing(32),
  },
}));

export default function NameInsertDialog({
  open,
  onSetName,
}: {
  open: boolean;
  onSetName: (name: string) => void;
}) {
  const classes = useStyles({});
  const [value, setValue] = useState<string>("");

  return (
    <Dialog open={open}>
      <form onSubmit={e => e.preventDefault()}>
        <DialogTitle>Enter your name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            value={value}
            className={classes.control}
            onChange={e => setValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            disabled={!value}
            type="submit"
            onClick={() => onSetName(value)}
            color="primary"
          >
            Play
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
