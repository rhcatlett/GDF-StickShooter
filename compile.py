progText="""var sketchProc=function(processingInstance){ with (processingInstance){
size(400, 400); 
frameRate(60);
"""

f=open("final.js","r")
filename = 'runCode.js'
with open(filename, 'w') as file_object:
    file_object.write(progText)
    file_object.write(f.read())
    file_object.write("}};")
#print(f.read())
#print(progText)
#print(f.read())
#print("}};")