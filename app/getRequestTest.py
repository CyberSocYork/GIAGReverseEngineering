import requests

def main():

    response = requests.post(url= 'http://cyberSoc.pythonanywhere.com/getUserNames',json={'authId':'cyberSocAdmin','authPassword':'toor'})
    print("{}".format(response.content))

if __name__ == "__main__":

    main()