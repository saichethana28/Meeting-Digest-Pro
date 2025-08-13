#include<iostream>
#include<vector>
using namespace std;

class Node{
    public:
    int data;
    Node* next;

    public:
    Node(int data1,Node* next1){
        int data=data1;
        Node* next=next1;
    }
    public:
    Node(int data2){
        int data=data2;
        Node* next=nullptr;
    }
}

int main(){
    vector<int> arr={2,6,8,0,33,4};
    Node* head=new Node(33);
    cout<<head->data;
}