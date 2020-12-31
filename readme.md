A simple script to get account balance and monthly transactions from Caixa Econômica Federal internet banking (for companies account type aka "PJ").

This was very challenging to make it works.

The machine/VM must be registered as a secure station at Caixa Internet Banking.

To run it in the cloud, I created a VM with Linux on GCP, install the gnome (or some other window system). You need to run the first time visually, then authorized that machine on caixa internet banking, and then you can run the script from the command line. 

Uses headless chromium (puppeteer) to get account balance and download the period transactions in CSV format.