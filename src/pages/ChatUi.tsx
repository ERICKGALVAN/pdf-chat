import {
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  Grid,
  Paper,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useState, useContext } from "react";
import PdfContext from "../context/PdfContext";
import { v4 as uuidv4 } from "uuid";
import "../index.css";

interface Chat {
  by: string;
  text: string;
}

const ChatUI = () => {
  const pdfContext = useContext(PdfContext) as {
    chat: Chat[];
    makeQuestion: (question: string) => void;
    isThinking: boolean;
  };
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() !== "") {
      pdfContext.makeQuestion(input);
      setInput("");
    }
  };

  const handleInputChange = (event: any) => {
    setInput(event.target.value);
  };

  return pdfContext.chat ? (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "grey.200",
      }}
    >
      <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
        {pdfContext.chat.map((message) => (
          <Message key={uuidv4()} text={message.text} by={message.by} />
        ))}
        {pdfContext.isThinking && <div className="loading">...</div>}
      </Box>
      <Box sx={{ p: 2, backgroundColor: "background.default" }}>
        <Grid container spacing={2}>
          <Grid item xs={10}>
            <TextField
              size="small"
              fullWidth
              placeholder="Type a message"
              variant="outlined"
              value={input}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={2}>
            <Button
              fullWidth
              color="primary"
              variant="contained"
              endIcon={<SendIcon />}
              onClick={handleSend}
            >
              Send
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  ) : null;
};

const Message: React.FC<Chat> = ({ text, by }) => {
  const isBot = by === "ai";
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isBot ? "flex-start" : "flex-end",
        mb: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: isBot ? "row" : "row-reverse",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ bgcolor: isBot ? "primary.main" : "secondary.main" }}>
          {isBot ? "B" : "U"}
        </Avatar>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            ml: isBot ? 1 : 0,
            mr: isBot ? 0 : 1,
            backgroundColor: isBot ? "primary.light" : "secondary.light",
            borderRadius: isBot ? "20px 20px 20px 5px" : "20px 20px 5px 20px",
          }}
        >
          <Typography variant="body1">{text}</Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default ChatUI;