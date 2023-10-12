# How to Downgrade Mac App Store (MAS) Applications

This guide provides instructions on how to downgrade a specific application from the Mac App Store (MAS).

## Requirements

Before you begin, make sure you meet the following requirements:

- You have already purchased the target application on the MAS.
- You have the `disable-ssl-pinning.js` script, which can be downloaded [here](https://raw.githubusercontent.com/trungnghiatn/Downgrade-MAS-Applications/master/Scripts/disable-ssl-pinning.js).
- System Integrity Protection (SIP) is disabled on your Mac. For a detailed instruction on how to disable System Integrity Protection (SIP) on your Mac, you can refer to [this link](https://support.intego.com/hc/en-us/articles/115003523252-How-to-Disable-System-Integrity-Protection-SIP-). Remember to turn SIP back on after you have finished downgrading the app.
- Frida tools are installed. You can install them by running either of the following commands in the terminal:
  ```
  pip install frida-tools
  ```
  or
  ```
  pip3 install frida-tools
  ```
- Proxyman is installed on your Mac and its Root Certificate is trusted. Proxyman can be downloaded [here](https://proxyman.io/), and you can find instructions on how to trust the Root Certificate [here](https://docs.proxyman.io/debug-devices/macos).

## Downgrading

Follow these steps to downgrade the application:

1. Launch Proxyman and open the Mac App Store.

   - Search for the target app on the App Store. Make sure you have already purchased the app, as it will display the **Download** button instead of the **Get** or **Purchase** button.

2. Disable SSL Pinning on `appstoreagent`.

   - Open the Terminal and run the following command:

   ```
   frida appstoreagent -l path_to_disable_ssl_pinning_script
   ```

   - For example:

   ```
   frida appstoreagent -l ~/Downloads/disable_ssl_pinning.js
   ```

3. Enable SSL Proxying on `appstoreagent`.

   - In Proxyman, expand the traffic records in the Apps section.
   - Right-click on the `appstoreagent` process and select **Enable SSL Proxying**.

   ![Enable SSL Proxying](https://raw.githubusercontent.com/trungnghiatn/Downgrade-MAS-Applications/master/Images/enable-ssl-proxying.png)

4. Capture a list of App Version IDs.

   - Click on the Download button for the app on the App Store to start the download. The download will fail due to SSL verification.
   - Look at the response of a request like this: `https://p*-buy.itunes.apple.com/WebObjects/MZBuy.woa/wa/buyProduct?guid=*` (the * can be any character or digit). This request is from the `appstoreagent` process in Proxyman.
   - Find the key `softwareVersionExternalIdentifiers` and locate the list of app version IDs under it. The newest version is at the bottom. Choose the version that you want to downgrade.
   - *If you're not sure which version you're looking for, don't worry. It's okay to try and fail until you find the right one. Another option is to manually count the number of releases from the old version to the newest one and count backward in the ID list.*

   ![App Version IDs](https://raw.githubusercontent.com/trungnghiatn/Downgrade-MAS-Applications/master/Images/app-version-ids.png)

   - Replace `app_version_here` in the following text with your desired app version ID:

   ```
      <key>appExtVrsId</key>
      <string>app_version_here</string>
   ```

5. Create a traffic breakpoint.

   - In Proxyman, go to `Tool` > `Breakpoint` > `Rules` from the menu.
   - Enable the Breakpoint Tool and click the `+` button to create a new breakpoint.
   - Use the following rule for the breakpoint:
   
   ```
   https://p*-buy.itunes.apple.com/WebObjects/MZBuy.woa/wa/buyProduct?guid*
   ```
   
   ![Create a Breakpoint](https://raw.githubusercontent.com/trungnghiatn/Downgrade-MAS-Applications/master/Images/create-a-breakpoint.png)

6. Re-download the app.

   - Re-download the app from the App Store. Proxyman will show a window with the breakpoint.
   - Insert the code block from Step 4 into the request body.

   ![Modify Request Body](https://raw.githubusercontent.com/trungnghiatn/Downgrade-MAS-Applications/main/Images/modify-request-body.png)

7. Stop the disable-ssl-pinning script.

   - Close the terminal window that was running the command to disable SSL Pinning on `appstoreagent` from Step 2.

8. Execute the breakpoint.

   - Click the Execute button in the Breakpoint window from Step 6. The target app will be downloaded and installed with the lower version that you chose.

## Acknowledgement

- Thanks to [Azenla](https://gist.github.com/azenla/37f941de24c5dfe46f3b8e93d94ce909) for the original code.

---

If you found this guide helpful, consider supporting the project by buying me a coffee.

<a href="https://paypal.me/ltn119412" target="_blank"><img src="https://raw.githubusercontent.com/trungnghiatn/Downgrade-MAS-Applications/main/Images/buy-me-a-coffee.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
