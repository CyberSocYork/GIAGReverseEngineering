import requests

def main():

    response = requests.post(url= 'http://127.0.0.1:5000/getUserNames',json={'authId':'cyberSocAdmin','authPassword':'toor'})
    print("{}".format(response.content))

if __name__ == "__main__":

    main()