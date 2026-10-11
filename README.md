# AK Sister's Calculator

A keyboard-friendly calculator and unit converter built with plain HTML, CSS, and JavaScript. The calculator supports addition, subtraction, multiplication, and division, and saves calculation history in the current browser.

## Run it locally

Open `index.html` in a browser. No package installation, build step, or server is required.

## Use it

- Click the on-screen keys or type numbers and operators on your keyboard.
- Press **Enter** or **=** to calculate, **Backspace** to delete a digit, and **Esc** to clear.
- Choose an item in History to recall its result.
- History is stored locally in this browser and can be removed with **Clear**. It is not synchronized across devices.

## Convert units

Open **Metric Conversion**, choose **Length**, **Temperature**, **Area**, **Volume**, or **Weight**, then enter a value and select its **From** and **To** units. The result updates as you type; use the swap button to reverse the units. The converter includes commonly used metric/SI and imperial units, including US customary and imperial liquid measures. It does not aim to cover every specialized or historical unit.

## Publish with GitHub Pages

1. Sign in to GitHub in VS Code and open the **Source Control** view. If prompted, choose **Initialize Repository**, then choose **Publish to GitHub** and select a **public** repository. If VS Code says Git is missing, install Git and reopen VS Code.
2. In the repository, open **Settings → Pages** and set the build and deployment source to **GitHub Actions**.
3. The workflow in `.github/workflows/deploy.yml` publishes the static site when changes are pushed to the default branch. You can also run it manually from the **Actions** tab.
4. When the deployment finishes, GitHub Pages will show the public site URL under **Settings → Pages**. For a project repository, it usually looks like `https://<your-github-username>.github.io/<repository-name>/`.

The project is static and does not need a build command. The workflow uploads the repository contents directly as the Pages artifact.
