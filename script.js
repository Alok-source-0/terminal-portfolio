document.addEventListener("DOMContentLoaded", function () {
  const terminal = document.getElementById("terminal");
  const output = document.getElementById("terminal-output");
  const input = document.getElementById("command-input");

  const files = {
    "about.txt": `<span class="error">404 Not Found: The page 'about.txt' could not be located.</span>`,
    "projects.txt": `<span class="error">404 Not Found: The page 'projects.txt' could not be located.</span>`,
    "contact.txt": `
You can reach me via:
- Email:ralok3303@gmail.com
- Phone:+918434657293
`,
  };

  const commands = {
    help: `
Available commands:
  help      - Show this list of commands
  whoami    - Display the current user
  ls / dir  - List files in the directory
  cat / type- Read the content of a file
  clear / cls- Clear the terminal screen
  open      - Open a file (e.g., "open clock.html")
  gemini    - Ask Gemini a question (e.g., "gemini what is a neural network")
  logout    - Log out of the portfolio
`,
    whoami: () => `GOD FATHER\n<span class="warning">Warning: WITH GREAT POWER COMES GREAT RESPONSIBILITY</span>`,
    ls: () => {
        let fileList = "";
        for (const file in files) { fileList += `<span class="filename">${file}</span>\n`; }
        fileList += `<span class="filename">details.html</span>\n`;
        fileList += `<span class="filename">clock.html</span>`;
        return fileList.trim();
    },
    cat: (args) => {
        const filename = args[0];
        if (!filename) return `<span class="error">Error: Missing filename.</span>`;
        if (files[filename]) return files[filename];
        return `<span class="error">Error: File not found: ${filename}</span>`;
    },
    clear: () => { output.innerHTML = ""; return ""; },
    open: (args) => {
        const filename = args[0];
        if (filename === "details.html") {
            logToOutput(`Opening ${filename}...`);
            window.location.href = "details.html";
            return "";
        } else if (filename === "clock.html") {
            logToOutput(`Opening ${filename}...`);
            window.location.href = "clock.html";
            return "";
        }
        return `<span class="error">Error: Cannot open '${filename}'. File not found or not openable.</span>`;
    },
    // This command is now updated for Gemini
    gemini: async (args) => {
      const question = args.join(" ");
      if (!question) {
        return `<span class="error">Usage: gemini &lt;question&gt;</span>`;
      }
      try {
        logToOutput("Querying Gemini...");
        const response = await fetch('/ask-gemini', { // Updated endpoint
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: question }),
        });
        if (!response.ok) {
          return `<span class="error">Error: Could not connect to Gemini backend. Check server logs.</span>`;
        }
        const data = await response.json();
        return data.text;
      } catch (error) {
        return `<span class="error">An error occurred while querying Gemini. Is the server running and authenticated?</span>`;
      }
    },
    logout: () => {
        logToOutput("Logging out...");
        window.location.href = "/logout";
        return "";
    }
  };

  // Aliases for commands
  commands.dir = commands.ls;
  commands.type = commands.cat;
  commands.cls = commands.clear;

  // Event Listeners
  terminal.addEventListener("click", () => input.focus());

  input.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      const commandText = input.value.trim();
      if (commandText === "") return;
      logToOutput(`<span class="prompt">visitor@portfolio:~$</span> ${commandText}`);
      input.value = "";
      const parts = commandText.split(" ");
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);
      if (commands[cmd]) {
        const result = await commands[cmd](args);
        if (result !== undefined) { // Check for undefined to allow empty string results
          logToOutput(result);
        }
      } else {
        logToOutput(`<span class="error">Command not found: ${cmd}. Type 'help' for commands.</span>`);
      }
      terminal.scrollTop = terminal.scrollHeight;
    }
  });

  function logToOutput(html) {
    const line = document.createElement("div");
    line.classList.add("output-line");
    line.innerHTML = html.replace(/\n/g, '<br>');
    output.appendChild(line);
  }
  
  // Initial welcome message
  fetch('/check-auth') // A dummy endpoint to potentially check auth status (not strictly needed with server-side redirection)
    .then(response => {
      if (response.status === 401 || response.redirected) { // If server redirects to login or returns 401
        logToOutput("Please log in to access the portfolio.");
      } else {
        logToOutput("Welcome. Type 'help' to see a list of available commands.");
      }
    })
    .catch(() => {
        logToOutput("Welcome. Type 'help' to see a list of available commands.");
    });
});