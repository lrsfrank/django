from django.http import JsonResponse
from game.models.player.player import Player
def getinfo(request):
    user = request.user;
    if not user.is_authenticated:
        return JsonResponse({
            'result': "nologin"
            }) 
    else:
        player = Player.objects.all()[0]
        return JsonResponse({
            'result': "success",
            'username': player.user.username,
            'photo': player.photo,
            })

