import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListSubheader from "@material-ui/core/ListSubheader";
import Avatar from "@material-ui/core/Avatar";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import { orange, yellow, blue, green, red } from "@material-ui/core/colors";

import { City } from "../map";
import { Player } from "../gameTypes";

const useStyles = makeStyles(theme => ({
  listItem: {
    width: theme.spacing(32),
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
  listItemBreak: {
    [theme.breakpoints.down("md")]: {
      flexBasis: "100%",
      width: 0,
    },
  },
  startButton: {
    marginTop: theme.spacing(2),
    flexGrow: 1,
    [theme.breakpoints.down("md")]: {
      flexGrow: 0,
    },
  },
  sidebarCityName: {
    textTransform: "capitalize",
  },
  blueAvatar: {
    color: theme.palette.getContrastText(blue[500]),
    backgroundColor: blue[500],
  },
  redAvatar: {
    color: theme.palette.getContrastText(red[500]),
    backgroundColor: red[500],
  },
  greenAvatar: {
    color: theme.palette.getContrastText(green[500]),
    backgroundColor: green[500],
  },
  orangeAvatar: {
    color: theme.palette.getContrastText(orange[500]),
    backgroundColor: orange[500],
  },
  yellowAvatar: {
    color: theme.palette.getContrastText(yellow[500]),
    backgroundColor: yellow[500],
  },
}));

export default function GameSidebar({
  className,
  players,
  yourCities,
  isInitiator,
  startDisabled,
  onStartGame,
}: {
  players: Player[];
  yourCities: City[];
  className?: string;
  isInitiator: boolean;
  startDisabled: boolean;
  onStartGame(): void;
}) {
  const classes = useStyles();

  return (
    <List component="div" className={className}>
      <ListSubheader>Players</ListSubheader>
      {players.map(player => (
        <ListItem key={player.id} className={classes.listItem}>
          <ListItemAvatar>
            <Avatar className={(classes as any)[`${player.color}Avatar`]}>
              {player.name.substr(0, 1).toUpperCase()}
            </Avatar>
          </ListItemAvatar>
          <ListItemText>{player.name}</ListItemText>
        </ListItem>
      ))}

      <ListItem className={classes.listItem}>
        <Button
          onClick={onStartGame}
          className={classes.startButton}
          variant="contained"
          color="primary"
          disabled={startDisabled}
        >
          {isInitiator ? "Start Game" : "Wait the initiator to start"}
        </Button>
      </ListItem>

      <div className={classes.listItemBreak} />
      <Divider className={classes.divider} />

      <ListSubheader>Your Cities</ListSubheader>
      {yourCities.map(city => (
        <ListItem className={classes.listItem} key={city.name}>
          <ListItemAvatar>
            <Avatar className={(classes as any)[`${city.color}Avatar`]}>
              {city.name.substr(0, 1).toUpperCase()}
            </Avatar>
          </ListItemAvatar>
          <ListItemText className={classes.sidebarCityName}>
            {city.name}
          </ListItemText>
        </ListItem>
      ))}
    </List>
  );
}
