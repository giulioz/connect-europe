import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListSubheader from "@material-ui/core/ListSubheader";
import Avatar from "@material-ui/core/Avatar";
import { orange, yellow, blue, green, red } from "@material-ui/core/colors";

import { City } from "../map";

const useStyles = makeStyles(theme => ({
  listItem: {
    width: theme.spacing(32),
  },
  listItemBreak: {
    [theme.breakpoints.down("md")]: {
      flexBasis: "100%",
      width: 0,
    },
  },
  sidebarCityName: {
    textTransform: "capitalize",
  },
  blueCityAvatar: {
    color: theme.palette.getContrastText(blue[500]),
    backgroundColor: blue[500],
  },
  redCityAvatar: {
    color: theme.palette.getContrastText(red[500]),
    backgroundColor: red[500],
  },
  greenCityAvatar: {
    color: theme.palette.getContrastText(green[500]),
    backgroundColor: green[500],
  },
  orangeCityAvatar: {
    color: theme.palette.getContrastText(orange[500]),
    backgroundColor: orange[500],
  },
  yellowCityAvatar: {
    color: theme.palette.getContrastText(yellow[500]),
    backgroundColor: yellow[500],
  },
}));

export default function GameSidebar({
  className,
  players,
  yourCities,
}: {
  players: string[];
  yourCities: City[];
  className?: string;
}) {
  const classes = useStyles();

  return (
    <List component="div" className={className}>
      <ListSubheader>Players</ListSubheader>
      {players.map(player => (
        <ListItem className={classes.listItem}>
          <ListItemAvatar>
            <Avatar>{player.substr(0, 1).toUpperCase()}</Avatar>
          </ListItemAvatar>
          <ListItemText>{player}</ListItemText>
        </ListItem>
      ))}

      <div className={classes.listItemBreak} />

      <ListSubheader>Your Cities</ListSubheader>
      {yourCities.map(city => (
        <ListItem className={classes.listItem}>
          <ListItemAvatar>
            <Avatar className={(classes as any)[`${city.color}CityAvatar`]}>
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
